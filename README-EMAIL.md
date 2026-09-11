# Email — SendGrid (keluar) + Google Workspace (masuk)

Setup pengiriman email untuk form di website (booking/enquiry dan gift
card), plus pengaturan supaya email yang masuk ke
`info@healthylook-aesthetic.com` ikut tembusan ke `contact@algoseabiz.com`
selama masa testing.

Kode: [`src/app/api/enquiry/route.ts`](src/app/api/enquiry/route.ts).
Alat bantu: `npm run email:check` dan `npm run email:test`.

---

## 0. Ringkasan

Dua sistem, dua urusan, tidak saling ganggu:

| | Email **keluar** (form website) | Email **masuk** (pasien ke `info@`) |
|---|---|---|
| Ditangani | **SendGrid** | **Google Workspace** |
| Record DNS | `CNAME` di subdomain | `MX` |
| Diatur di | SendGrid + `.env` + Vercel | Admin Console / Gmail |

SendGrid meng-authenticate lewat `CNAME` di subdomain miliknya sendiri dan
**tidak pernah menyentuh `MX`** — jadi mailbox Google tetap jalan apa
adanya. Ini bukan teori: `dmgmasonry.ca` sudah menjalankan pasangan yang
sama persis, lihat [bagian 2](#2-referensi-yang-sudah-jalan-dmgmasonryca).

**Yang harus dikerjakan, urut:**

| # | Langkah | Di mana | Wajib? |
|---|---|---|---|
| 3.1 | Tambah domain ke akun SendGrid yang sudah ada | SendGrid | ✅ |
| 3.2 | Pasang 3 CNAME | Cloudflare | ✅ |
| 3.3 | Buat API key | SendGrid | ✅ |
| 3.4 | Isi env var | `.env.local` + Vercel | ✅ |
| 4.1 | Perbaiki SPF | Cloudflare | ✅ |
| 4.2 | Aktifkan DKIM Google | Admin Console + Cloudflare | ✅ |
| 4.3 | Perbaiki DMARC | Cloudflare | ⬜ sebaiknya |
| 4.4 | Hapus CNAME Hostinger yang basi | Cloudflare | ⬜ sebaiknya |
| 4.5 | Tembusan ke `contact@` | Admin Console / Gmail | ⬜ selama testing |
| 9 | Pasang Turnstile | Cloudflare + `.env` | ⬜ sebaiknya |

---

## 1. Kondisi DNS saat ini

DNS dikelola di **Cloudflare** (`gordon.ns.cloudflare.com`,
`zelda.ns.cloudflare.com`).

```
MX          → ASPMX.L.GOOGLE.com dkk                  ✓ Google Workspace, jangan disentuh
SPF         → v=spf1 include:_spf.mail.hostinger.com ~all   ✗ salah (4.1)
DKIM        → google._domainkey tidak ada                   ✗ belum aktif (4.2)
DMARC       → v=DMARC1; p=none; rua=mailto: mailer@…        ⚠ typo (4.3)
autoconfig  → autoconfig.mail.hostinger.com                 ⚠ basi (4.4)
autodiscover→ autodiscover.mail.hostinger.com               ⚠ basi (4.4)
SendGrid    → belum ada                                     → ditambah di 3.2
```

Domain ini dulu pakai mail Hostinger dan sudah pindah ke Google Workspace,
tapi tiga peninggalan Hostinger masih tertinggal di DNS: SPF, `autoconfig`,
dan `autodiscover`. Semuanya sekarang menunjuk server yang tidak lagi
memegang email domain ini.

---

## 2. Referensi yang sudah jalan: `dmgmasonry.ca`

Domain agency ini sudah memakai kombinasi yang sama dan terverifikasi
hidup:

```
MX     → aspmx.l.google.com dkk
SPF    → v=spf1 include:_spf.google.com -all
DKIM   → s1._domainkey → s1.domainkey.u48461817.wl068.sendgrid.net   ✓ resolve
       → s2._domainkey → s2.domainkey.u48461817.wl068.sendgrid.net
       → em1590        → u48461817.wl068.sendgrid.net
DMARC  → v=DMARC1; p=none;
```

Dua pelajaran dari sini, keduanya menghemat waktu:

**a. SPF-nya tidak menyebut SendGrid sama sekali.** Dengan Automated
Security, return-path email SendGrid ada di subdomain `em1590.` — jadi
penerima memeriksa SPF di subdomain itu, yang record-nya dipegang
SendGrid. SPF di root tidak perlu diubah untuk keperluan form.

**b. `u48461817` adalah akun SendGrid yang sudah Anda punya.** Satu akun
SendGrid bisa meng-authenticate banyak domain. Jadi
`healthylook-aesthetic.com` cukup **ditambahkan ke akun itu** — tidak
perlu daftar baru.

> Ini penting secara biaya: Twilio menghapus free plan SendGrid pada Mei
> 2025, dan pendaftar **baru** cuma dapat trial 60 hari sebelum wajib
> bayar ~$19.95/bulan. Akun lama tidak terkena itu. Sebelum mulai,
> pastikan akun `u48461817` masih aktif: **Settings → Account Details**,
> cek plan dan sisa kuotanya.

---

## 3. Setup SendGrid

### 3.1 Tambahkan domain ke akun yang sudah ada

1. Login ke [app.sendgrid.com](https://app.sendgrid.com) dengan akun yang
   sama seperti `dmgmasonry.ca`.
2. **Settings → Sender Authentication → Authenticate Your Domain**.
3. Isi:
   - DNS host: **Cloudflare**
   - Domain: `healthylook-aesthetic.com`
   - Advanced Settings: biarkan **Automated Security = ON**
4. **Next** → SendGrid menampilkan 3 record `CNAME`.

Bentuknya akan mirip `dmgmasonry.ca`, dengan nomor `em` berbeda tapi ID
akun (`u48461817`) sama:

```
emXXXX.healthylook-aesthetic.com          →  u48461817.wl068.sendgrid.net
s1._domainkey.healthylook-aesthetic.com   →  s1.domainkey.u48461817.wl068.sendgrid.net
s2._domainkey.healthylook-aesthetic.com   →  s2.domainkey.u48461817.wl068.sendgrid.net
```

**Pakai nilai yang SendGrid tampilkan, jangan menyalin dari contoh di
atas** — nomor `emXXXX` unik per domain.

### 3.2 Pasang CNAME di Cloudflare

**Cloudflare → DNS → Records → Add record**, tiga kali, satu per record.

> ### ⚠️ Jebakan Cloudflare — penyebab gagal nomor satu
>
> Setiap `CNAME` harus **"DNS only" (awan abu-abu)**, bukan "Proxied"
> (awan oranye). Cloudflare memasang proxy secara default.
>
> `CNAME` yang di-proxy resolve ke IP Cloudflare, bukan ke server
> SendGrid. SendGrid akan bilang *"It looks like the DNS records have not
> been added"* selamanya walaupun record-nya sudah benar.
>
> `dmgmasonry.ca` tidak kena ini karena DNS-nya di Hostinger, yang tidak
> punya fitur proxy. Cloudflare punya — jadi di sini harus disengaja.

Setelah ketiganya masuk, balik ke SendGrid dan klik **Verify**. Kalau
masih merah, tunggu 15–30 menit lalu ulangi.

Dari terminal, ini menunjukkan record mana yang belum lolos satu per satu:

```bash
npm run email:check
```

### 3.3 Buat API key

**Settings → API Keys → Create API Key**

- Nama: `healthylook-website`
- Akses: **Restricted Access**, aktifkan **Mail Send** saja. Jangan Full
  Access — key ini di-deploy ke Vercel dan tidak butuh apa pun selain
  mengirim.
- Key hanya ditampilkan **sekali**. Kalau hilang, hapus dan buat baru.

> Buat key **baru** khusus website ini, jangan pakai ulang key
> `dmgmasonry.ca`. Kalau salah satu bocor, yang perlu dicabut cuma satu
> dan situs yang lain tetap jalan.

### 3.4 Isi environment variables

Di `.env.local` — satu baris yang perlu diisi, sisanya sudah terisi:

```
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxx
```

Yang sudah terisi:

```
ENQUIRY_FROM_EMAIL=no-reply@healthylook-aesthetic.com
ENQUIRY_TO_EMAIL=info@healthylook-aesthetic.com
ENQUIRY_BCC_EMAIL=contact@algoseabiz.com
```

Di produksi: **Vercel → Project → Settings → Environment Variables**, isi
keempatnya, lalu **Redeploy**. Env var baru tidak berlaku di deployment
yang sudah jalan.

Catatan:

- **`ENQUIRY_FROM_EMAIL` bukan mailbox.** Ini identitas pengirim. Jangan
  diisi `info@healthylook-aesthetic.com` — mailbox itu ada di Google
  Workspace, dan kalau SendGrid mengirim "atas nama" alamat itu, inbox
  klinik menerima email yang seolah dikirim dirinya sendiri, yang justru
  dicurigai Gmail.
- Tidak ada yang perlu membaca balasan ke `no-reply@`: setiap enquiry
  memakai alamat pengirim form sebagai `Reply-To`, jadi tombol **Reply**
  di Gmail langsung menuju pasien.
- `ENQUIRY_TO_EMAIL` dan `ENQUIRY_BCC_EMAIL` boleh diisi lebih dari satu
  alamat, pisahkan dengan koma.
- **`ENQUIRY_BCC_EMAIL` dihapus setelah handover selesai.**

---

## 4. Setup Google Workspace

Semua di [admin.google.com](https://admin.google.com) dengan akun **super
admin**, kecuali yang ditandai lain.

> Label tombol Google kadang berubah sedikit antar versi console. Kalau
> teks yang Anda lihat beda tipis, cari yang paling mirip di posisi yang
> sama — alurnya tidak berubah.

### 4.1 Perbaiki SPF

SPF domain masih menunjuk Hostinger. Yang terpengaruh **bukan email form**
— email form lewat SendGrid dan SPF-nya diperiksa di subdomain `emXXXX.`
(lihat [bagian 2a](#2-referensi-yang-sudah-jalan-dmgmasonryca)).

Yang terpengaruh adalah **email yang dikirim orang klinik sendiri dari
Gmail**: sekarang semuanya gagal SPF, karena Hostinger tidak lagi
mengirim untuk domain ini dan Google tidak terdaftar.

1. **Cloudflare → DNS → Records**, cari `TXT` di nama `@` yang diawali
   `v=spf1`.
2. **Edit**, ganti isinya jadi:

   ```
   v=spf1 include:_spf.google.com ~all
   ```

3. Save.

Satu domain hanya boleh punya **satu** record SPF. **Edit** yang lama,
jangan menambah record `TXT` kedua yang juga diawali `v=spf1` — dua SPF
membuat SPF dianggap invalid, hasilnya lebih buruk daripada tidak ada.

> `dmgmasonry.ca` memakai `-all` (tolak keras) alih-alih `~all` (tandai
> saja). `-all` memang lebih aman dari spoofing, tapi jangan mulai dari
> situ: kalau ternyata masih ada sistem lain yang mengirim atas nama
> domain ini, `-all` langsung membuang emailnya. Pakai `~all` dulu,
> naikkan setelah beberapa minggu tidak ada masalah.

### 4.2 Aktifkan DKIM Google

`google._domainkey` belum ada, artinya email keluar dari Gmail belum
ditandatangani. Ini terpisah dari DKIM SendGrid — yang satu untuk email
yang dikirim orang, yang satu untuk email yang dikirim website.

1. **Menu → Apps → Google Workspace → Gmail** → **Authenticate email**.
2. Pilih domain `healthylook-aesthetic.com`.
3. **Generate new record**:
   - **Key length**: **2048**
   - **Prefix selector**: biarkan **`google`**
   - **Generate**
4. Salin dua nilai:
   - **DNS Host name** → `google._domainkey`
   - **TXT record value** → string panjang diawali `v=DKIM1;`
5. **Cloudflare → DNS → Add record**: type `TXT`, name `google._domainkey`,
   content = nilai langkah 4. Save. (Record `TXT` tidak punya opsi proxy,
   jadi tidak ada jebakan awan oranye di sini.)
6. Balik ke **Authenticate email** → **Start authentication**.
7. Status berubah jadi **"Authenticating email with DKIM"**. Biasanya
   beberapa menit; Google menyebut bisa sampai 48 jam.

### 4.3 Perbaiki DMARC

Sekarang:

```
v=DMARC1; p=none; rua=mailto: mailer@healthylook-aesthetic.com
```

Ada spasi setelah `mailto:` sehingga alamat laporan tidak valid dan
laporan agregat tidak pernah terkirim.

**Cloudflare → DNS**, edit `TXT` di `_dmarc` jadi (tanpa spasi):

```
v=DMARC1; p=none; rua=mailto:mailer@healthylook-aesthetic.com
```

Biarkan `p=none` dulu. Naikkan ke `p=quarantine` hanya setelah SPF, DKIM
Google, dan authentication SendGrid semuanya hijau minimal 2 minggu.

### 4.4 Hapus peninggalan Hostinger

Dua record ini masih ada di DNS:

```
autoconfig.healthylook-aesthetic.com    CNAME  autoconfig.mail.hostinger.com
autodiscover.healthylook-aesthetic.com  CNAME  autodiscover.mail.hostinger.com
```

Keduanya dipakai Outlook, Thunderbird, dan aplikasi mail di HP untuk
menebak setting server secara otomatis. Sekarang keduanya menunjuk
Hostinger, yang **tidak lagi memegang email domain ini** — jadi siapa pun
yang mencoba menambahkan `info@healthylook-aesthetic.com` ke Outlook akan
diarahkan ke server yang salah dan gagal login tanpa penjelasan.

Hapus keduanya di **Cloudflare → DNS**. Google Workspace tidak
membutuhkannya; Gmail dan aplikasi Google mengatur dirinya sendiri.

Record `_acme-challenge` dan `CAA` boleh dibiarkan — tidak ada
hubungannya dengan email.

### 4.5 Tembusan `info@` ke `contact@algoseabiz.com`

Cek dulu `info@` itu apa: **Directory → Users** cari `info`. Kalau tidak
ada di sana, cek **Directory → Groups**. Hasilnya menentukan cara mana
yang dipakai.

---

#### Cara A — Routing rule (paling rapi, butuh super admin)

Menyalin **semua** email yang masuk ke `info@`, termasuk yang dikirim
pasien langsung dari HP-nya.

1. **Menu → Apps → Google Workspace → Gmail → Routing**.
2. Di bagian **Routing**, klik **Configure** (atau **Add another rule**).
3. Nama: `Tembusan info@ ke agency (testing)`
4. **Select when this action is applied** — centang:
   - ☑ **Inbound** (wajib)
   - ☑ **Internal - receiving** kalau mau ikut email antar sesama domain
   - Biarkan **Outbound** dan **Internal - sending** kosong — itu email
     yang *dikirim* klinik.
5. **Action** → **Modify message**.
6. **Also deliver to** → centang **☑ Add more recipients** → **Add** →
   pilih **Basic** → isi `contact@algoseabiz.com` → **Save**.
7. **Envelope filter** → centang **☑ Only affect specific envelope
   recipients** → **Single email address** → `info@healthylook-aesthetic.com`.

   > ⚠️ Langkah 7 paling sering kelewat. Tanpa envelope filter, rule
   > berlaku untuk **semua** alamat di domain — email setiap karyawan ikut
   > ditembuskan ke agency.

8. **Save**. Berlaku dalam beberapa menit.

**Mematikannya nanti:** buka rule yang sama, klik ikon hapus.

---

#### Cara B — Forwarding dari Gmail (tanpa akses admin)

1. Login ke Gmail sebagai `info@healthylook-aesthetic.com`.
2. **Settings (⚙) → See all settings → Forwarding and POP/IMAP**.
3. **Add a forwarding address** → `contact@algoseabiz.com` →
   **Next → Proceed**.
4. Buka email konfirmasi di `contact@algoseabiz.com`, klik linknya.
5. Balik ke settings `info@`, pilih **Forward a copy of incoming mail to**
   → dropdown sebelahnya: **keep Gmail's copy in the Inbox**.

   > Jangan pilih *delete* atau *archive* — itu memindahkan email klinik
   > keluar dari inbox mereka sendiri.

6. **Save Changes** di bawah halaman.

Hanya berlaku untuk email yang **masuk setelah** setting dinyalakan.

---

#### Cara C — Kalau `info@` ternyata Google Group

**Directory → Groups** → grup `info` → **Members → Add members** →
`contact@algoseabiz.com`, role **Member**, subscription **Each email**.

---

#### Yang sudah aktif dari sisi aplikasi

`ENQUIRY_BCC_EMAIL` sudah menembuskan setiap kiriman form ke
`contact@algoseabiz.com` — tidak perlu menunggu akses admin.

| | Form website | Email pasien langsung ke info@ |
|---|---|---|
| `ENQUIRY_BCC_EMAIL` | ✓ tertembus | ✗ tidak lewat kode sama sekali |
| Routing rule / forwarding | ✓ tertembus | ✓ tertembus |

Saling melengkapi, bukan duplikat. Kalau dua-duanya aktif, `contact@`
menerima kiriman form **dua kali** — wajar selama testing.

**Setelah testing selesai:**

1. Hapus `ENQUIRY_BCC_EMAIL` dari `.env.local` **dan** Vercel, lalu
   redeploy.
2. Hapus routing rule (A), matikan forwarding (B), atau keluarkan anggota
   dari grup (C).

---

## 5. Yang berubah di kode

- `src/app/api/enquiry/route.ts` memanggil SendGrid v3
  (`POST https://api.sendgrid.com/v3/mail/send`). Tanpa dependency
  tambahan — tetap `fetch` biasa.
- `ENQUIRY_TO_EMAIL` menerima banyak alamat (dipisah koma).
- Variabel baru `ENQUIRY_BCC_EMAIL` untuk tembusan diam-diam.
- Alamat yang muncul di `to` dan `bcc` sekaligus disaring, karena SendGrid
  menolak seluruh request kalau ada duplikat.
- Selama `SENDGRID_API_KEY` kosong, route mengembalikan 503 dan form
  otomatis jatuh ke WhatsApp — bukan pura-pura berhasil.
- Script `scripts/email.cjs` (`npm run email:check`, `npm run email:test`).

Form dan tampilan tidak berubah sama sekali.

---

## 6. Cara menguji

```bash
npm run email:check
```

Cek key masih hidup, punya izin Mail Send, dan **status tiap record DNS
satu per satu** — ini yang menghemat waktu waktu verify di SendGrid masih
merah, karena langsung menyebut CNAME mana yang belum lolos.

```bash
npm run email:test
```

Kirim satu email sungguhan ke `ENQUIRY_TO_EMAIL` + `ENQUIRY_BCC_EMAIL`
lewat jalur yang sama dengan form. Kalau ditolak, error asli SendGrid
ditampilkan (route sengaja menyembunyikannya dari pengunjung).

```bash
npm run dev
```

Lalu isi form di `/book-now` dan halaman gift card. Cek `info@`, cek
`contact@algoseabiz.com`, cek folder spam keduanya.

Verifikasi header: buka email yang masuk → **⋮ → Show original**. Harus
terlihat `SPF: PASS`, `DKIM: PASS`, `DMARC: PASS`.

Terakhir, skor deliverability: [mail-tester.com](https://www.mail-tester.com),
salin alamat sekali-pakai ke `ENQUIRY_TO_EMAIL` sementara, jalankan
`npm run email:test`, lihat skornya. Target ≥ 8/10.

---

## 7. Kalau bermasalah

| Gejala | Penyebab hampir selalu |
|---|---|
| `email:check` → 401 | API key salah ketik, atau sudah di-revoke |
| key hidup tapi tanpa `mail.send` | Key dibuat tanpa permission Mail Send. Buat ulang. |
| `email:test` → 403 Forbidden | `ENQUIRY_FROM_EMAIL` di domain yang belum di-authenticate |
| SendGrid terus bilang DNS belum ada | CNAME di Cloudflare masih **Proxied** (awan oranye). Ubah ke DNS only. |
| 400 "should be unique between to, cc, and bcc" | Alamat sama di `ENQUIRY_TO_EMAIL` dan `ENQUIRY_BCC_EMAIL` |
| Form error, langsung tawarin WhatsApp | `SENDGRID_API_KEY` belum di-set di Vercel, atau belum redeploy |
| Email form masuk spam | Authentication SendGrid belum hijau semua |
| Email dari Gmail `info@` masuk spam | SPF masih menunjuk Hostinger (4.1) atau DKIM Google belum aktif (4.2) |
| Gmail menampilkan "via sendgrid.net" | Pakai Single Sender, bukan domain authentication |
| Outlook gagal setup `info@` | CNAME `autoconfig`/`autodiscover` masih menunjuk Hostinger (4.4) |
| Routing rule dibuat tapi tidak ada tembusan | Envelope filter salah alamat, atau **Inbound** tidak dicentang |
| Semua karyawan ikut ketembus | Envelope filter tidak diisi — rule berlaku sedomain (4.5 langkah 7) |
| Enquiry sampai, tapi Reply salah alamat | Wajar: `From` adalah `no-reply@`; tombol **Reply** menuju pasien lewat `Reply-To` |

---

## 8. Catatan: kenapa bukan SMTP Google Workspace

Jalur itu sempat dibangun lalu dibatalkan. Secara teknis jalan — relay di
`smtp-relay.gmail.com:587` dengan app password — tapi tiga hal membuatnya
kalah untuk form yang jadi jalur masuk utama klinik:

1. **Tidak ada catatan pengiriman.** Google tidak memberi aplikasi laporan
   apa pun. Kalau satu enquiry hilang, satu-satunya jejak adalah Email Log
   Search di Admin Console — tidak bisa dibaca kode, tidak bisa dicek
   cepat.
2. **Kredensialnya app password milik akun manusia.** Butuh 2-Step
   Verification aktif, dan mati diam-diam begitu ada yang me-reset
   password akun itu.
3. **Butuh dependency `nodemailer`** dan menambah 1–3 detik pada setiap
   cold start karena handshake SMTP.

SendGrid memberi Activity feed (setiap email kelihatan diterima, dibuka,
bounce, atau ditolak), dan karena akunnya sudah ada, tidak menambah biaya
maupun vendor baru.

Kalau suatu saat mau pindah lagi, perubahannya terkurung di satu fungsi:
`sendEmail()`. Sisa route — validasi, honeypot, rate limit, penyusunan
HTML, `Reply-To`, BCC — tidak tersentuh.

---

## 9. Cloudflare Turnstile (proteksi spam form)

Terpasang di **dua form publik**: enquiry/booking dan gift card. Keduanya
lewat `/api/enquiry`, jadi satu verifikasi menutup dua-duanya.

Form admin (`/admin/login` dan lainnya) **tidak** dipasangi: yang di dalam
dashboard ada di balik login sehingga bukan sasaran spam, dan yang di
halaman login memakai server action — plumbing-nya berbeda. Kalau login
admin mau ikut dilindungi dari brute force, itu pekerjaan terpisah.

### 9.1 Ambil kunci

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Turnstile** →
   **Add widget**
2. Widget mode: **Managed**
3. Hostnames: masukkan `healthylook-aesthetic.com` **dan** `localhost`
   — tanpa `localhost`, widget tidak jalan waktu development
4. Salin **Site Key** dan **Secret Key**

### 9.2 Isi env var

```
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAA...
TURNSTILE_SECRET_KEY=0x4AAAAAAA...
```

`NEXT_PUBLIC_` di depan site key itu wajib — kunci itu memang ikut
terkompilasi ke halaman dan aman dilihat publik. Secret key **tidak boleh**
diberi prefix itu.

Isi juga keduanya di **Vercel → Settings → Environment Variables**, lalu
redeploy.

### 9.3 Rollout-nya sengaja terbagi dua

| Kondisi | Yang terjadi |
|---|---|
| Site key kosong | Widget tidak dirender sama sekali |
| Secret key kosong | Server melewati verifikasi |
| Dua-duanya kosong | Form persis seperti sebelum Turnstile ada |
| Dua-duanya terisi | Proteksi aktif |

Jadi tidak ada urutan pemasangan yang bisa membuat form menolak semua
orang. Tapi **pasang berpasangan di produksi**: site key tanpa secret key
menampilkan kotak verifikasi yang tidak memverifikasi apa pun.

### 9.4 Keputusan desain yang perlu diketahui

**Widget-nya terlihat, bukan `interaction-only`.** Mode tersembunyi memang
lebih rapi, tapi setiap cara Turnstile bisa gagal — script diblokir
extension, proxy kantor, token kedaluwarsa saat orang mengisi sembilan
kolom — jadi tidak kelihatan: pengunjung menekan Send, dapat error umum,
dan tidak tahu ada tahap verifikasi. Form ini jalur masuk utama klinik,
jadi kegagalan yang terlihat lebih baik daripada yang senyap.

**Verifikasi dijalankan SETELAH validasi kolom.** Kalau salah ketik email,
pengunjung dapat pesan error kolom sementara token-nya belum terpakai —
perbaiki lalu kirim lagi langsung berhasil. Kalau urutannya dibalik,
percobaan kedua gagal dengan `timeout-or-duplicate`, error yang tidak bisa
dipahami pengunjung.

**Gagal-terbuka saat Cloudflare tidak bisa dihubungi.** Kalau siteverify
timeout atau membalas 5xx, enquiry tetap diteruskan. Alasannya: itu tidak
mengatakan apa pun tentang si pengunjung, dan menolak semua enquiry selama
gangguan pihak lain mengorbankan pasien nyata demi mencegah beberapa email
spam — yang honeypot dan rate limit masih saring. Verdict `success:false`
yang sungguhan tetap ditolak. Kalau trade-off ini suatu saat dianggap
salah, tempat mengubahnya cuma satu: blok `catch` di `verifyTurnstile()`.

### 9.5 Test key Cloudflare

Untuk kerja lokal tanpa widget sungguhan:

```
site   1x00000000000000000000AA             selalu lolos (terlihat)
       2x00000000000000000000AB             selalu blokir
secret 1x0000000000000000000000000000000AA  selalu lolos
       2x0000000000000000000000000000000AA  selalu gagal
```

### 9.6 Kalau bermasalah

| Gejala | Penyebab |
|---|---|
| Form selalu `captcha_failed` di localhost | `localhost` belum ditambahkan ke hostname widget (9.1) |
| Widget tidak muncul sama sekali | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` kosong, atau belum redeploy setelah diisi |
| Widget muncul tapi semua kiriman lolos | `TURNSTILE_SECRET_KEY` kosong — server melewati verifikasi |
| Gagal di percobaan kedua saja | Token sekali pakai. Widget seharusnya di-reset otomatis; kalau tidak, cek `turnstileResetSignal` di `useEnquirySubmit`. |
| `invalid-input-secret` di log server | Secret key salah ketik, atau site key dan secret dari widget yang berbeda |
