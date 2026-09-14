# Cache — kenapa perubahan tidak langsung tampil, dan auto-purge Cloudflare

Kode: [`src/lib/cloudflare.ts`](src/lib/cloudflare.ts).

---

## 0. Masalahnya, terukur

Diukur langsung dari domain live saat dokumen ini ditulis:

```
$ curl -I https://healthylook-aesthetic.com/

Server: cloudflare
cf-cache-status: HIT
Age: 551720            ← 551.720 detik = 6,4 HARI
Cache-Control: max-age=7200
```

Cloudflare menyajikan salinan HTML berumur **6,4 hari**. Editor yang
menerbitkan perubahan tidak akan melihatnya selama berhari-hari, dan tidak
ada apa pun di CMS yang memberi tahu bahwa ada yang salah.

Catatan kondisi saat ini: domain itu **masih melayani situs WordPress lama**
di Hostinger (`x-powered-by: PHP/8.2.33`, `platform: hostinger`,
`x-litespeed-cache: hit`). Situs Next.js belum dipindah ke sana.

Tapi konfigurasi cache Cloudflare-nya **tidak ikut berubah saat cutover**.
Kalau dibiarkan apa adanya, ia akan melakukan hal yang sama persis ke situs
baru.

---

## 1. Kenapa Next.js saja tidak cukup

Ada **dua** cache di depan situs ini, bukan satu:

| | Tahu kapan konten berubah? | Diberi tahu oleh |
|---|---|---|
| **Next.js / Vercel** | ✅ ya | `revalidateTag()` dari CMS |
| **Cloudflare** | ❌ tidak | tidak ada — sampai sekarang |

Selama ini CMS hanya memberi tahu yang pertama. Masalahnya pengunjung tidak
pernah sampai ke Vercel — mereka berhenti di Cloudflare. Jadi cache yang
paling penting untuk dibersihkan justru yang tidak pernah diberi tahu.

Auto-purge ini menutup celah itu: setiap jalur kode yang membatalkan cache
Next sekarang membatalkan cache Cloudflare juga.

---

## 2. Yang memicu purge

| Sumber konten | Jalur | Kapan |
|---|---|---|
| **Sanity Studio** | `POST /api/revalidate/sanity` | Webhook, setiap publish |
| **Dashboard admin** | `revalidateContent()` di `src/lib/content.ts` | Simpan, hapus dokumen |
| **Import CSV** | `src/lib/importContent.ts` | Setelah import selesai |

Ketiganya lewat satu fungsi, `purgeCloudflareCache()`.

---

## 3. Setup

### 3.1 Zone ID

Cloudflare dashboard → klik domain `healthylook-aesthetic.com` →
**Overview** → sidebar kanan bawah, **Zone ID**. Salin.

### 3.2 API token

**My Profile → API Tokens → Create Token → Create Custom Token**

- Nama: `healthylook-cache-purge`
- **Permissions**: `Zone` → `Cache Purge` → `Purge`
- **Zone Resources**: `Include` → `Specific zone` → `healthylook-aesthetic.com`

> ⚠️ Beri **satu** izin itu saja. Token yang cuma bisa mengosongkan cache
> tidak berguna bagi siapa pun kalau bocor. Token "Edit zone" bisa
> mengalihkan domain ke server lain.

### 3.3 Isi env var

Di `.env.local` dan di **Vercel → Settings → Environment Variables**:

```
CLOUDFLARE_ZONE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLOUDFLARE_PURGE_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Di Vercel: `CLOUDFLARE_ZONE_ID` boleh **Config**, `CLOUDFLARE_PURGE_TOKEN`
harus **Secret**. Jangan pakai prefix `NEXT_PUBLIC_` pada keduanya —
token itu tidak boleh pernah sampai ke browser.

Selama **salah satu** kosong, purge dilewati dan CMS berjalan persis
seperti sebelumnya. Jadi ini aman dipasang sekarang dan dinyalakan nanti.

---

## 4. Keputusan desain

**Purge seluruh zone, bukan per-URL.** Mengosongkan hanya halaman yang
diedit terdengar lebih hemat dan hasilnya salah: copy sebuah treatment
muncul di halaman treatment itu sendiri, di indeks treatment, di shortlist
homepage, dan di navigasi. "URL mana yang terpengaruh edit ini" adalah peta
yang harus dirawat selamanya dan langsung salah begitu ada yang lupa
memperbaruinya. Situs ini diedit beberapa kali sehari oleh satu klinik —
cache dingin yang terisi ulang dalam hitungan menit jauh lebih murah
daripada bug yang sulit dilacak.

**Purge dijalankan SETELAH `revalidateTag`, tidak pernah sebelum.** Kalau
dibalik, ada jendela waktu di mana Cloudflare menarik ulang halaman yang
belum sempat dibangun ulang Next — salinan basi langsung kembali ke edge,
dan purge-nya tampak tidak berefek.

**Purge di-`await`, bukan fire-and-forget.** Di serverless, `fetch` yang
tidak ditunggu akan dibatalkan begitu response dikirim. Purge-nya akan
berhasil di komputer lokal dan diam-diam tidak pernah terjadi di produksi.
Biayanya beberapa ratus milidetik pada tombol Simpan editor, dan itu
sepadan: saat tombolnya selesai, perubahannya benar-benar sudah tampil.

**Kegagalan purge tidak pernah menggagalkan penyimpanan.** Purge gagal
berarti konten basi beberapa saat. Purge gagal yang ikut membatalkan
tulisan editor jauh lebih buruk.

---

## 5. Yang sebaiknya dilakukan saat cutover

Auto-purge ini membereskan gejalanya. Tapi ada pertanyaan yang layak
ditanyakan sekalian: **apakah Cloudflare perlu meng-cache HTML sama sekali?**

Cache HTML seagresif ini kemungkinan besar warisan setup WordPress +
LiteSpeed, di mana itu memang masuk akal — HTML PHP mahal untuk dibuat.
Next.js di Vercel berbeda: Vercel sudah punya CDN sendiri yang memahami
ISR dan on-demand revalidation, jadi HTML-nya sudah cepat dan sudah tahu
kapan harus diperbarui.

Dua pilihan, dua-duanya sah:

| | Cloudflare cache HTML | Konsekuensi |
|---|---|---|
| **A** | Ya, + auto-purge ini | Lebih cepat untuk pengunjung jauh dari edge Vercel. Bergantung pada purge yang selalu berhasil. |
| **B** | Tidak (bypass untuk HTML) | Lebih sederhana, tidak ada cache kedua untuk dipikirkan. Aset statis tetap di-cache Cloudflare. |

Rekomendasi saya **B**, dengan auto-purge tetap menyala.

### 5.1 Jangan dihapus sekarang

Rule yang ada saat ini sedang melayani situs WordPress yang masih live.
Menghapusnya hari ini hanya membuat situs lama lebih lambat tanpa manfaat
apa pun. Ini pekerjaan **saat cutover**, bukan sebelumnya.

### 5.2 Tiga tempat yang perlu diperiksa

Bukan satu daftar, tiga. Sudah dipastikan lewat header bahwa **APO tidak
aktif** (tidak ada `cf-apo-via`), jadi penyebabnya ada di dua yang pertama:

| Tempat | Yang dicari | Tindakan saat cutover |
|---|---|---|
| **Caching → Cache Rules** | Rule dengan *Eligible for cache* pada HTML, atau *Edge TTL* yang menimpa header origin | Ubah jadi bypass untuk HTML, atau hapus |
| **Rules → Page Rules** (lama) | `Cache Level: Cache Everything` | Hapus — Next.js tidak membutuhkannya |
| **Speed → Optimization → APO** | Khusus WordPress | Sudah tidak aktif; matikan kalau langganannya masih jalan |

Periksa dulu isinya sebelum menghapus. Sebagian rule mungkin mengatur
aset statis atau redirect, yang tetap berguna setelah pindah.

### 5.3 Tuas kedua: Browser Cache TTL

Ini yang paling sering terlewat, karena **tidak bisa di-purge oleh siapa
pun**.

Response dari domain live mengirim `Cache-Control: max-age=7200` ke
browser pengunjung — bahkan pada 301 yang tidak di-cache Cloudflare. Itu
berasal dari **Caching → Configuration → Browser Cache TTL**, disetel 2
jam untuk seluruh zone.

Artinya: walaupun auto-purge bekerja sempurna, pengunjung yang sudah
pernah membuka halaman tetap melihat versi lama sampai 2 jam, dari cache
di komputernya sendiri. Purge hanya membersihkan salinan di edge
Cloudflare, tidak pernah salinan di browser orang.

Saat cutover, set **Browser Cache TTL → Respect Existing Headers**. Next.js
mengirim header yang benar per jenis aset: HTML tidak boleh disimpan lama,
file di `/_next/static/` punya hash di namanya dan aman di-cache setahun.
Setelan sezona 2 jam merusak keduanya sekaligus — terlalu lama untuk HTML,
terlalu pendek untuk aset ber-hash.

---

## 6. Cache Rules yang diperlukan

Panduan konkret untuk zone `healthylook-aesthetic.com` setelah domain
pindah ke Vercel. Disusun dengan membandingkan konfigurasi `adding-value.de`
(Next.js + Sanity, sudah jalan) dengan konfigurasi HLA saat ini.

### 6.1 Baca ini dulu: urutan rule menentukan segalanya

Cache Rules **bertumpuk**. Kalau beberapa rule cocok untuk satu request,
semuanya diterapkan berurutan, dan untuk setelan yang bentrok:

> "If several matching rules set a value for the same setting, the value in
> the **last matching rule** wins."
> — [Cloudflare, Order and priority](https://developers.cloudflare.com/cache/how-to/cache-rules/order/)

Ini **berbeda dari Page Rules lama**, yang berhenti di rule pertama yang
cocok. Konsekuensinya satu dan menentukan:

> ### Rule *bypass* harus berada DI BAWAH rule *Cache Everything*.

Kalau bypass ditaruh di atas, Cache Everything yang berjalan belakangan
akan menimpanya dan halaman admin ikut ter-cache.

**Urutan di HLA sekarang sudah benar** (Cache Everything #1, bypass #3–#4).
Yang perlu diganti isinya, bukan urutannya.

**Urutan di `adding-value.de` justru terbalik** — bypass di #1–#5, Cache
Everything di #6. Itu hanya aman kalau expression Cache Everything-nya
secara eksplisit mengecualikan path-path tersebut. Di screenshot teks
match-nya terpotong (`...URI Path starts with /login or /sign-up or URI…`)
sehingga tidak bisa dipastikan. **Jangan salin urutannya** — salin daftar
rule-nya saja.

### 6.2 Rule yang dibutuhkan HLA

Lima rule, dalam urutan ini:

| # | Nama | Match against | Action |
|---|---|---|---|
| 1 | `Cache Everything` | Hostname equals `healthylook-aesthetic.com` **or** `www.healthylook-aesthetic.com` | Eligible for cache · Edge TTL **1 hari** · Browser TTL **Respect origin** |
| 2 | `Bypass API` | URI Path starts with `/api/` | Bypass cache |
| 3 | `Bypass Admin` | URI Path starts with `/admin` | Bypass cache |
| 4 | `Bypass Studio` | URI Path starts with `/studio` | Bypass cache |
| 5 | `Bypass sesi & preview` | Cookie contains `hla_session` **or** Cookie contains `__prerender_bypass` | Bypass cache |

Kenapa masing-masing:

**1 — Cache Everything.** Pakai **Hostname**, bukan `URI Full wildcard`
seperti rule HLA sekarang. Rule yang ada sekarang cuma cocok untuk
`https://healthylook-aesthetic.com/*` sehingga `www.` tidak tercakup.
Edge TTL 1 hari: cukup panjang untuk berguna, cukup pendek supaya kalau
auto-purge pernah gagal, situs pulih sendiri dalam sehari.

**2 — `/api/`.** Paling kritis. Di situ ada `/api/enquiry` (form),
`/api/revalidate/sanity` (webhook), dan `/api/draft-mode/*`. Response
yang ter-cache di sini berarti webhook revalidasi berhenti bekerja dan
form bisa membalas response milik orang lain.

**3 — `/admin`.** Dashboard admin. Middleware hanya mengecek keberadaan
cookie; halamannya sendiri berisi data per-user.

**4 — `/studio`.** Sanity Studio, aplikasi ber-autentikasi.

**5 — cookie.** Jaring pengaman untuk dua hal yang tidak terikat path:
editor yang sedang login (`hla_session`) tidak boleh dilayani halaman
cache, dan halaman preview draft (`__prerender_bypass`, cookie milik Next
draft mode) tidak boleh ikut tersimpan di edge lalu tersaji ke publik.

### 6.3 Rule WordPress yang dihapus

Ketiganya menunjuk path yang tidak ada di Next.js:

| Rule sekarang | Nasib |
|---|---|
| `Bypass wp admin` — `/wp-admin/*` | **Hapus** — tidak ada WordPress lagi |
| `Bypass login` — `/wp-login.php*` | **Hapus** — sama |
| `_GRECAPTCHA` (Disabled) | **Hapus** — sudah mati, dan situs baru pakai Turnstile |
| `Cache Everything [Template]` | **Edit**, jangan hapus — ubah match ke Hostname dan set TTL seperti 6.2 |

### 6.4 Dibandingkan `adding-value.de`

| Rule di adding-value.de | Perlu di HLA? |
|---|---|
| Bypass Account (`/login`, `/sign-up`) | ❌ HLA tidak punya akun pengunjung |
| Bypass Billingpage | ❌ tidak ada billing |
| Bypass API (`/api/*`) | ✅ **ya** — rule #2 |
| Bypass Admin (`/studio/*`) | ✅ **ya** — rule #4, plus `/admin` yang tidak dipunya mereka |
| Bypass Login | ❌ sudah tercakup rule #3 dan #5 |
| Cache Everything | ✅ **ya** — rule #1 |
| Course Page (`/course/*`) | ❌ jenis konten mereka; halaman HLA sudah tercakup rule #1 |

HLA butuh satu yang mereka tidak punya: **bypass berbasis cookie** (#5).
Situs mereka memisahkan area login lewat path, situs ini lewat cookie
sesi dan draft mode.

### 6.5 Setelan di luar Cache Rules

**Caching → Configuration → Browser Cache TTL → `Respect Existing Headers`.**

Ini bukan Cache Rule dan sering terlewat. Sekarang disetel 2 jam untuk
seluruh zone, dan **cache browser tidak bisa di-purge oleh siapa pun** —
lihat 5.3. Next.js mengirim header yang benar per jenis file; biarkan
header itu yang menang.

### 6.6 Yang tidak perlu dikhawatirkan

**Form submit dan server action aman.** Cloudflare tidak meng-cache
request `POST` — Cache Everything hanya berlaku untuk `GET` dan `HEAD`.
Jadi kiriman form enquiry tidak akan pernah dilayani dari cache, bahkan
tanpa rule #2. Rule #2 tetap diperlukan untuk melindungi response `GET`
di bawah `/api/`.

**Aset statis sudah beres.** File di `/_next/static/` punya hash di
namanya dan aman di-cache selamanya. Rule #1 sudah mencakupnya, dan
karena namanya berubah setiap build, tidak pernah ada masalah basi.

---

## 7. Cara menguji

Setelah domain pindah ke Vercel dan env var terisi:

1. Ubah satu teks di Sanity Studio atau dashboard admin, publish.
2. Segera muat halaman yang terpengaruh.
3. Perubahannya harus langsung tampil.

Kalau mau melihat bukti di header:

```bash
curl -sI https://healthylook-aesthetic.com/ | grep -iE "cf-cache-status|age:"
```

Tepat setelah publish, `cf-cache-status` harus `MISS` (atau `EXPIRED`) dan
`Age` kembali ke `0`. Kalau masih `HIT` dengan `Age` besar, purge-nya tidak
jalan.

---

## 8. Kalau bermasalah

| Gejala | Penyebab |
|---|---|
| `[cloudflare] purge failed: 10000 Authentication error` | Token salah, atau tidak punya izin Cache Purge |
| `[cloudflare] purge failed: 7003` | `CLOUDFLARE_ZONE_ID` salah — pastikan Zone ID, bukan Account ID |
| Purge sukses tapi halaman masih basi | Rule "Cache Everything" ikut menyimpan di browser pengunjung. Cek `Cache-Control` yang dikirim ke browser — `max-age` besar tidak bisa di-purge dari server mana pun. |
| Tidak ada log sama sekali | Salah satu env var kosong, jadi purge dilewati. Itu memang perilakunya. |
| Berubah di incognito tapi tidak di browser biasa | Cache browser, bukan Cloudflare. Hard refresh. |
