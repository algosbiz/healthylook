# Laporan page speed — Healthy Look Aesthetic

Dikerjakan 29 Okt 2026. Branch: `perf/page-speed-2026-10-29` (dari `main`, terpisah dari rilis SEO). Belum di-push dan belum deploy.

## 1. Apa masalahnya

Lighthouse mobile pada situs **live** (28 Okt, kode lama):

| Halaman | Skor | LCP | TBT | Ukuran halaman |
| --- | --- | --- | --- | --- |
| `/` | 47 | 11,6 s | 540 ms | 1,76 MB |
| `/pricing` | 51 | 12,5 s | 480 ms | 1,74 MB |
| `/ubud-bali/botox` | 60 | 6,7 s | 520 ms | 1,74 MB |

Dua hal menghabiskan bandwidth dan CPU di setiap halaman:

1. **Cloudflare Turnstile dimuat di semua halaman.** Formulir booking ada di dasar hampir semua halaman, dan widget-nya dimulai saat halaman dimuat: sekitar **850–930 KB**, lebih dari separuh berat halaman, diunduh bersamaan dengan foto hero dan font. Sebagian besar pengunjung tidak pernah sampai ke formulir.
2. **`SanityLive` dan `VisualEditing` dikirim ke semua pengunjung.** Keduanya hanya berguna di mode draf (Studio → Presentation). Halaman publik tidak lagi membaca lewat Live, jadi koneksi itu tidak me-revalidate apa pun. Sekitar **226 KB JavaScript** dan satu koneksi terbuka per pengunjung.

## 2. Yang diubah

| File | Perubahan |
| --- | --- |
| `src/components/shared/TurnstileField.tsx` | Turnstile dimulai saat formulir berjarak 600 px dari layar, atau saat satu kolomnya difokus (pengguna keyboard / tautan anchor). Formulir yang sudah terlihat di layar (`/book-now`) mulai langsung, seperti sebelumnya |
| `src/components/sanity/SanityRuntime.tsx` | `SanityLive` dan `VisualEditing` hanya dirender saat draft mode aktif |
| `src/components/shared/PageHero.tsx`, `SanityHeroSection.tsx` | Gambar hero memakai `fetchPriority="high"` (audit "LCP discovery" Lighthouse sebelumnya gagal tepat di sini) |
| `README-SANITY.md` | Bagian yang menyebut Sanity Live untuk pengunjung disesuaikan |

Tidak ada perubahan desain, teks, atau perilaku formulir.

## 3. Hasil

Build produksi lokal (`next build` + `next start`), konten published, Lighthouse 12.8.2, mobile, throttling simulasi. **Median dari 3 kali ukur** per halaman, sebelum dan sesudah dengan prosedur yang sama.

| Halaman | Skor | TBT | Ukuran halaman | JavaScript sendiri | JS tidak terpakai | Request | LCP |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` sebelum | 79 | 521 ms | 1.567 KB | 441 KB | 208 KB | 55 | 3,24 s |
| `/` sesudah | **91** | **54 ms** | **484 KB** | **215 KB** | **45 KB** | **33** | 3,39 s |
| `/pricing` sebelum | 80 | 444 ms | 1.555 KB | 441 KB | 208 KB | 52 | 3,42 s |
| `/pricing` sesudah | **92** | **86 ms** | **469 KB** | **214 KB** | **45 KB** | **30** | 3,27 s |
| `/ubud-bali/botox` sebelum | 84 | 374 ms | 1.570 KB | 441 KB | 207 KB | 58 | 3,19 s |
| `/ubud-bali/botox` sesudah | **92** | **67 ms** | **488 KB** | **215 KB** | **45 KB** | **36** | 3,21 s |

Rata-rata: ukuran halaman **−69%**, JavaScript **−51%**, TBT **−85%**, skor **+8 sampai +12**. Request Turnstile saat dimuat: dari 853–859 KB menjadi 0.

**LCP tidak berubah** di pengukuran lokal (sekitar 3,2–3,4 s di semua kasus, selisihnya masih dalam derau antar-run). Alasannya: server lokal tidak punya latensi jaringan, sedangkan pada situs live LCP 6,7–12,5 s sebagian besar adalah antrean bandwidth dengan 1 MB skrip Turnstile dan JavaScript. Penghapusan antrean itu hampir pasti memperbaiki LCP live, tapi **angkanya baru bisa dibuktikan di Vercel Preview**.

## 3b. Mobile, 9 jenis halaman

Semua angka di laporan ini adalah **mobile** (emulasi ponsel, jaringan 4G lambat 1,6 Mbps, CPU 4× lebih pelan). Pembandingnya skor live: 28–29 Okt, satu kali ukur per halaman, kode lama. Sesudah: build `perf` lokal, median 2 kali ukur.

| Halaman | Live (sebelum) | Lokal (sesudah) | Berat halaman live → lokal |
| --- | --- | --- | --- |
| `/` | 48 | 93 | 1.720 → 485 KB |
| `/pricing` | 64 | 92 | 1.695 → 467 KB |
| `/before-after` | 60 | 92 | 1.896 → 657 KB |
| `/ubud-bali` | 52 | 93 | 1.670 → 446 KB |
| `/our-doctor` | 64 | 93 | 1.743 → 510 KB |
| `/ubud-bali/botox` | 65 | 93 | 1.738 → 487 KB |
| `/ubud-bali/iv-drip` | 57 | 93 | 1.784 → 540 KB |
| `/how-long-does-botox-last` | 61 | 94 | 1.745 → 506 KB |
| `/special-offers` | 65 | 93 | 1.771 → 530 KB |

**Jangan membaca 92–94 sebagai skor yang akan muncul di PageSpeed Insights setelah deploy.** Angka lokal pasti terlalu optimis, karena:

- Server lokal menjawab dalam 6–12 ms; server live 99–1.726 ms (request pertama setelah cache kedaluwarsa).
- **Build lokal tidak mereproduksi preload font.** HTML live memuat 11 tag `<link rel="preload" as="font">` (111 KB, semua prioritas tinggi, berebut dengan CSS dan foto hero); build lokal memuat 0 dan hanya mengambil 4 file (47 KB). Ini mungkin akibat path folder berapostrof (`irene's`) yang sudah dikenal bermasalah untuk build di komputer ini.
- Skor live sendiri berderau besar: enam kali ukur halaman yang sama memberi beranda 45–54, `/pricing` 52–73, `/ubud-bali/botox` 50–66.

Yang bisa dipercaya dari angka lokal adalah **selisih byte dan waktu CPU** (−70% berat halaman, −85% TBT), yang tidak bergantung pada lingkungan. Seberapa jauh skor live naik hanya bisa dipastikan di Vercel Preview.

Dua halaman live paling buruk, beranda (48) dan `/ubud-bali` (52), punya pola sama: FCP 4,5–4,8 s padahal waktu respons server hanya 99 ms, dan CSS pemblokir render ±940 ms (halaman lain ±255 ms). Penyebabnya belum terbukti; dugaan terkuat adalah rebutan bandwidth antara CSS dan 11 font + Turnstile, yang perbaikan ini kurangi tetapi tidak bisa saya reproduksi secara lokal.

## 4. Diuji fungsinya

Di Chrome headless sungguhan lewat protokol DevTools (halaman HIFU, viewport mobile):

| Kondisi | Request Turnstile | `window.turnstile` | Token tersisip di formulir |
| --- | --- | --- | --- |
| Setelah halaman dimuat | 0 | tidak ada | tidak |
| Formulir masih ±900 px di bawah layar | 0 | tidak ada | tidak |
| Formulir 400 px dari atas layar | 2 | ada | **ya** |
| Setelah fokus ke kolom formulir (di panel browser Claude, yang tidak menjalankan IntersectionObserver) | 2 | ada | n/a |

Tidak ada koneksi ke Sanity dari halaman publik. Semua rute publik tetap statis (`○`/`●`) di build.

**Belum diuji:** mengirim formulir (akan mengirim email sungguhan), dan mode draf di Studio → Presentation (butuh URL bertanda tangan dari Studio; kodenya memakai pola standar `draftMode()` dari next-sanity).

## 5. Yang dicoba dan hasilnya tidak sah

- **`preload: false` untuk font Poppins.** Dicoba di build lokal; tidak ada perubahan (4 file font dimuat sebelum dan sesudah). **Kesimpulan itu tidak berlaku untuk live**: build lokal tidak punya tag preload font sama sekali, sedangkan live punya 11. Eksperimen ini harus diulang di Vercel Preview. Perubahan di kode sudah dibatalkan.
- **Memblokir Turnstile pada situs live lewat Lighthouse** untuk meniru dampak perbaikan di infrastruktur sungguhan: flag `--blocked-url-patterns` tidak terpasang (`blockedUrlPatterns=null`), jadi data itu hanyalah pengulangan baseline.

## 6. Kandidat berikutnya (belum dikerjakan)

- **Ukur ulang di Vercel Preview** (PageSpeed Insights, mobile): satu-satunya cara memastikan skor dan LCP live. Sekalian uji A/B font `preload: false` di Preview terpisah.
- CSS 16 KB memblokir render (~150–500 ms tergantung jaringan); `experimental.inlineCss` bisa menghilangkannya, tapi masih eksperimental.
- Foto hero 65 KB di `/pricing` (diperkirakan bisa 25–45 KB lebih kecil dengan kualitas lebih rendah); ini menyangkut kualitas foto, jadi keputusan klinik.
- Request pertama setelah cache kedaluwarsa masih 2–3 detik di server live (`x-vercel-cache: REVALIDATED`): periksa `revalidate`, region fungsi Vercel, dan cara Sanity di-cache.
