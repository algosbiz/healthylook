# Mengubah Meta Title & Description

Semua meta title dan description ada di **satu file**:

```
src/data/seo.ts
```

Tidak ada file halaman yang menyimpan teksnya sendiri. Ubah string di file
ini, dan tab browser, hasil Google, serta preview link WhatsApp semuanya ikut
berubah. Tidak ada file lain yang perlu disinkronkan.

---

## Langkah-langkah

### 1. Buka `src/data/seo.ts`

Isinya dua daftar:

| Daftar | Untuk apa | Kuncinya |
|---|---|---|
| `PAGE_SEO` | 11 halaman statis | path URL — `"/"`, `"/pricing"`, `"/our-doctor"` |
| `TREATMENT_SEO` | 32 halaman treatment | slug treatment — `"botox"`, `"hifu/body"` |

### 2. Cari entri yang mau diubah

Halaman statis — cari path-nya:

```ts
"/pricing": {
  title: "Price List | Aesthetic Treatment Cost in Bali",
  description:
    "Discover affordable medi spa treatment prices in Ubud, Bali. ...",
},
```

Halaman treatment — cari slug-nya (sama persis dengan `slug` di
`src/data/treatments.ts`):

```ts
botox: {
  title: "Affordable Botox in Ubud Bali",
  description:
    "Get safe and affordable Botox in Ubud, Bali, ...",
},
```

### 3. Ganti teksnya, simpan

Ubah isi tanda kutip saja. **Jangan** ubah kuncinya (`"/pricing"`, `botox`) —
kunci itu yang menghubungkan entri ke halamannya.

Kalau teksnya mengandung tanda kutip ganda, pakai `\"` atau ganti ke kutip
tunggal:

```ts
title: "Botox \"Baby Dose\" di Ubud",
```

### 4. Cek hasilnya

```bash
npm run dev
```

Buka halamannya, lalu **View Source** (Ctrl+U) dan cari `<title>` serta
`<meta name="description">`. Atau di Console:

```js
document.title
document.querySelector('meta[name=description]').content
```

> Judul di tab browser adalah sumber kebenarannya. React DevTools tidak
> menampilkan meta tag.

---

## Panjang yang disarankan

| | Aman | Terpotong di Google |
|---|---|---|
| Title | 50–60 karakter | > ~60 |
| Description | 140–160 karakter | > ~160 |

Google tetap memotong lebih pendek di mobile. Taruh kata terpenting di awal.

Cek panjang semua entri sekaligus:

```bash
node -e "const s=require('fs').readFileSync('src/data/seo.ts','utf8');[...s.matchAll(/title: \"([^\"]+)\"/g)].forEach(m=>{if(m[1].length>60)console.log(m[1].length,m[1])})"
```

---

## Menambah halaman treatment baru

1. Tambahkan treatment-nya di `src/data/treatments.ts`.
2. Tambahkan entri dengan slug yang sama di `TREATMENT_SEO`.

Kalau langkah 2 dilewat, halaman **tidak error**. Ia otomatis memakai
`"<Nama Treatment> in Ubud, Bali"` dan `shortDescription`-nya sebagai
cadangan. Itu aman untuk sementara, tapi bukan teks yang dioptimalkan —
tetap isi entrinya.

---

## Menambah halaman statis baru

1. Tambahkan entri di `PAGE_SEO` dengan path-nya, misalnya `"/faq"`.
2. Di file halaman `src/app/faq/page.tsx`:

```tsx
import { getPageSeo } from "@/data/seo";

const seo = getPageSeo("/faq")!;

export const metadata: Metadata = {
  title: { absolute: seo.title },
  description: seo.description,
  alternates: { canonical: "/faq" },
  openGraph: { title: seo.title, description: seo.description },
};
```

Tanda `!` berarti "entri ini pasti ada". Kalau path-nya salah ketik, halaman
akan error saat build — itu disengaja, supaya salah ketik ketahuan sekarang
dan bukan setelah live.

---

## Soal `{ absolute: ... }`

Di `src/app/layout.tsx` ada template judul:

```ts
title: { template: `%s | Healthy Look Aesthetic` }
```

Artinya judul biasa otomatis dapat imbuhan `| Healthy Look Aesthetic`.
Halaman-halaman di atas memakai `{ absolute: seo.title }` untuk **melewati**
template itu, supaya judulnya sama persis dengan website lama.

- Mau imbuhan otomatis? Ganti `title: { absolute: seo.title }` → `title: seo.title`,
  lalu hapus nama brand dari `seo.ts`.
- Mau kontrol penuh per halaman (seperti sekarang)? Biarkan `absolute`.

Jangan pakai keduanya — nanti jadi
`"Botox | Healthy Look Aesthetic | Healthy Look Aesthetic"`.

---

## Artikel blog

14 artikel mengambil meta dari `src/data/articles.ts` (field `title` dan
`description` di tiap artikel), **bukan** dari `seo.ts`. Itu disengaja:
judul artikel dipakai juga sebagai `<h1>` dan judul kartu di halaman blog,
jadi menyimpannya dua kali akan membuat keduanya bisa berbeda.

Untuk mengubah meta artikel, edit `title`/`description` di `articles.ts`.

---

## ⚠ Empat hal dari website lama yang sebaiknya diperbaiki

Semua meta di `seo.ts` disalin **apa adanya** dari website lama. Empat di
antaranya bermasalah dan sudah ditandai `FIXME` di file itu:

1. **Tiga judul memakai fallback WordPress** — nama domain mentah muncul di
   tab browser:
   - `/ubud-bali` → `Treatment - healthylook-aesthetic.com`
   - `/before-after` → `Before & After - healthylook-aesthetic.com`
   - `/gift-card` → `Gift Card - healthylook-aesthetic.com`

2. **`/our-blog` punya title dan description yang identik dengan
   `/our-doctor`** — persis sama kata per kata. Dua halaman bersaing di kata
   kunci yang sama, dan Google hanya akan memilih salah satu.

3. **`/gift-card` tidak punya meta description sama sekali** di website lama.
   Di sini diisi teks cadangan supaya tidak kosong.

4. **Description Eye Rejuvenation isinya tentang Botox** — menyebut kerutan,
   bruxism, dan kontur tubuh, tidak menyebut area mata sama sekali.

Masing-masing sudah ada saran penggantinya di komentar `FIXME` pada
`src/data/seo.ts`. Semua bisa diperbaiki hanya dengan mengganti satu string.

---

# Sitemap & robots.txt

Dua file yang memberi tahu Google halaman mana yang ada dan mana yang tidak
boleh dibuka:

| URL | Isinya |
|---|---|
| `/sitemap.xml` | Daftar semua halaman publik + kapan terakhir diubah |
| `/robots.txt` | Aturan crawl, plus alamat sitemap di atas |

## Tidak perlu diedit manual

`/sitemap.xml` dibuat otomatis dari isi website — katalog treatment, artikel,
dan dokumen Sanity. Tambah treatment baru, sitemap-nya ikut bertambah. Hapus
satu artikel, URL-nya hilang dari sitemap. **Tidak ada daftar URL yang harus
disinkronkan dengan tangan.**

Sitemap ikut ter-update begitu ada yang di-publish (lewat tag cache yang sama
dengan halamannya), dan paling lambat satu jam sekali kalau webhook-nya
meleset.

## Yang diblokir dari Google

Di `src/app/robots.txt/route.ts`:

```
Disallow: /studio    ← Sanity Studio
Disallow: /admin     ← dashboard konten
Disallow: /api/      ← endpoint, bukan halaman
```

Selain itu semua boleh di-crawl. **Jangan** blokir `/_next/` — Google perlu
CSS dan JavaScript untuk melihat halaman apa adanya.

Halaman `/studio` dan `/admin` juga sudah mengirim `noindex, nofollow`
sendiri. Keduanya sengaja dipasang: robots.txt mencegah crawler membuka
halamannya sama sekali, dan tag `noindex` menjaga kalau ada yang sampai ke
sana lewat link sebelum robots.txt terbaca.

Preview deployment di Vercel memblokir semuanya (`Disallow: /`), supaya
website tidak terindeks dua kali di alamat yang bukan domain klinik.

## Menyembunyikan satu halaman dari Google

Di Sanity, buka dokumennya → tab **SEO** → centang **hide from search**
(`noIndex`). Halaman itu langsung:

- mengirim `noindex` ke Google, dan
- **hilang dari sitemap** — kedua hal itu harus sejalan, karena sitemap yang
  mendaftarkan halaman `noindex` adalah website yang menyuruh Google membuka
  halaman yang sekaligus disuruh dibuang.

## Tanggal `<lastmod>`

Diambil dari yang paling tahu, berurutan:

1. Sanity `_updatedAt` — waktu edit sungguhan
2. Dashboard (`documents.updated_at`) — waktu simpan sungguhan
3. Sitemap website lama — `src/data/legacySitemap.ts`

Nomor 3 ada karena isi halaman disalin apa adanya dari website lama, jadi
"terakhir berubah" memang tanggal website lama, bukan tanggal build. Halaman
yang tidak punya tanggal dari mana pun tetap masuk sitemap, hanya tanpa
`lastmod` — itu wajar, dan lebih baik daripada mengarang tanggal.

## Setelah website live

1. Submit `https://healthylook-aesthetic.com/sitemap.xml` di **Google Search
   Console** (Sitemaps → Add a new sitemap).
2. Alamat sitemap lama (`/sitemap_index.xml`, `/page-sitemap.xml`,
   `/post-sitemap.xml`) sudah di-redirect ke yang baru, jadi tidak ada yang
   mati — tapi tetap submit yang baru, karena Search Console mencatat sitemap
   yang dialihkan sebagai peringatan.

## Cek isinya

```bash
curl http://localhost:3006/sitemap.xml
```

```bash
curl http://localhost:3006/robots.txt
```

Hitung jumlah URL-nya:

```bash
curl -s http://localhost:3006/sitemap.xml | grep -c "<loc>"
```

Per 10 September 2026 hasilnya **56** — persis 57 URL dari sitemap website
lama, dikurangi `/ubud-bali/slimming-body-contouring` yang diminta klien
dihapus dan sekarang di-redirect ke `/ubud-bali#body-treatments`.
