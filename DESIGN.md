# Arahan Desain: BukuKasir UMKM

Aplikasi kasir (point of sale), manajemen persediaan stok, dan pembukuan laba-rugi untuk pelaku usaha mikro, kecil, dan menengah (UMKM).

## 1. Dials (Tingkat Energi, Ritme, & Gerak)
- **ENERGY: 1 (Tenang & Fungsional)**: Dirancang untuk lingkungan kasir nyata. Mengutamakan kecepatan input transaksi dan kontras tinggi di bawah cahaya toko.
- **RHYTHM: 1 (Teratur & Konsisten)**: Struktur grid produk dan panel nota pesanan konsisten agar kasir terbiasa secara intuitif.
- **MOTION: 1 (Responsif & Ringan)**: Tanpa animasi dekoratif yang memperlambat kasir; transisi cepat hanya untuk indikator klik dan status.

## 2. Palet Warna & Kontras (WCAG AA Teruji)
- **Teks Utama**: `#0f172a` (Kontras 17.85:1 terhadap putih)
- **Teks Pendukung**: `#475569` (Kontras 7.58:1 terhadap putih)
- **Aksen Utama**: `#0f766e` (Kontras 5.47:1 terhadap putih)
- **Latar Belakang**: `#f8fafc`
- **Permukaan Kartu/Panel**: `#ffffff`
- **Garis Batas**: `#cbd5e1`
- **Indikator Untung / Sukses**: `#047857` (Kontras 6.2:1)
- **Indikator Habis / Peringatan**: `#be123c` (Kontras 6.5:1)

## 3. Tipografi
- **Antarmuka Utama**: `Plus Jakarta Sans`, sans-serif terukur yang tajam dan nyaman dibaca.
- **Nominal Rupiah & Struk**: `JetBrains Mono`, monospace untuk kerapian sejajar nominal angka.

## 4. Aksesibilitas & Responsivitas Manusia
- **Target Sentuh Minimum**: 44px x 44px pada layar sentuh ponsel.
- **Fokus Keyboard Penuh**: Indikator fokus jelas (`:focus-visible`) dan navigasi tombol tanpa mouse.
- **Dukungan Cetak Thermal**: Templat cetak 58mm/80mm tanpa elemen antarmuka browser.
- **Bekerja 100% Offline**: Menggunakan LocalStorage dan Service Worker PWA.
