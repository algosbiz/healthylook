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

## 6. Cara menguji

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

## 7. Kalau bermasalah

| Gejala | Penyebab |
|---|---|
| `[cloudflare] purge failed: 10000 Authentication error` | Token salah, atau tidak punya izin Cache Purge |
| `[cloudflare] purge failed: 7003` | `CLOUDFLARE_ZONE_ID` salah — pastikan Zone ID, bukan Account ID |
| Purge sukses tapi halaman masih basi | Rule "Cache Everything" ikut menyimpan di browser pengunjung. Cek `Cache-Control` yang dikirim ke browser — `max-age` besar tidak bisa di-purge dari server mana pun. |
| Tidak ada log sama sekali | Salah satu env var kosong, jadi purge dilewati. Itu memang perilakunya. |
| Berubah di incognito tapi tidak di browser biasa | Cache browser, bukan Cloudflare. Hard refresh. |
