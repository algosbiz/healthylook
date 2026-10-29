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

## 5. Yang dicoba dan tidak dipakai

- **`preload: false` untuk font Poppins.** Dugaan saya sepuluh file dipreload di tiap halaman; ternyata halaman hanya memuat 4 file (47 KB) dalam kedua kasus. Tidak ada beda, dibatalkan.

## 6. Kandidat berikutnya (belum dikerjakan)

- Ukur ulang di Vercel Preview untuk melihat LCP nyata.
- CSS 16 KB memblokir render (~150–500 ms tergantung jaringan); `experimental.inlineCss` bisa menghilangkannya, tapi masih eksperimental.
- Foto hero 65 KB di `/pricing` (diperkirakan bisa 25–45 KB lebih kecil dengan kualitas lebih rendah); ini menyangkut kualitas foto, jadi keputusan klinik.
- Request pertama setelah cache kedaluwarsa masih 2–3 detik di server live (`x-vercel-cache: REVALIDATED`): periksa `revalidate`, region fungsi Vercel, dan cara Sanity di-cache.
