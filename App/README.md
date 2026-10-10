# BukuKasir UMKM

Aplikasi Kasir POS (Point of Sale) & Pembukuan Toko untuk UMKM Indonesia, dengan dukungan:
- **Desktop POS (Electron)**: Integrasi scanner barcode laser (HID mode) dan printer struk thermal (silent printing 58mm/80mm).
- **Mobile Android (Capacitor)**: Portabel untuk tablet kasir atau ponsel Android.
- **PWA (Progressive Web App)**: Beroperasi 100% offline dengan LocalStorage.

---

## Struktur Direktori

```text
App/
├── docs/                     # Dokumentasi teknis & panduan desain
│   ├── DESIGN.md             # Arahan palet warna, tipografi, dan aksesibilitas
│   └── MAINTENANCE.md        # Panduan integrasi hardware kasir (printer & scanner)
├── scripts/                  # Skrip otomatisasi build & generator aset
│   ├── build-apk.bat         # Batch script kompilasi APK Android
│   ├── prepare-www.js        # Penyiapan aset web untuk sinkronisasi Capacitor
│   ├── generate-icons.js     # Generator file icon.ico dan icon.png
│   └── generate-android-icons.js # Generator icon adaptive & splash screen Android
├── android/                  # Proyek native Android (Capacitor)
├── index.html                # Antarmuka utama aplikasi kasir
├── style.css                 # Gaya desain kasir & templat struk thermal
├── app.js                    # Logika bisnis POS, keranjang, dan event scanner laser
├── main.js                   # Proses utama Electron (IPC printer thermal & window)
├── preload.js                # Jembatan keamanan IPC Electron (posBridge)
├── sw.js                     # Service Worker untuk kapabilitas offline PWA
├── manifest.json             # Manifest web app
├── capacitor.config.ts       # Konfigurasi Capacitor Android
├── package.json              # Dependensi dan skrip proyek
├── start-desktop.bat         # Peluncur cepat aplikasi Desktop (Windows)
└── LICENSE                   # Lisensi proyek
```

---

## Cara Menjalankan

### 1. Desktop POS (Electron)
- **Melalui File**: Klik ganda `start-desktop.bat`.
- **Melalui Terminal**:
  ```bash
  npm start
  ```

### 2. Membangun Installer Desktop Windows (.exe)
```bash
npm run dist
```
Hasil installer siap distribusi akan tersimpan di folder `dist/`.

### 3. Membangun APK Android
- **Melalui Terminal**:
  ```bash
  npm run build:apk
  ```
- **Melalui Script**:
  Jalankan berkas `scripts/build-apk.bat`.
Berkas APK akan tersimpan di folder `dist-apk/`.

---

## Dokumentasi Terkait
- [Panduan Hardware & Desktop POS](docs/MAINTENANCE.md)
- [Arahan Desain & Aksesibilitas](docs/DESIGN.md)
