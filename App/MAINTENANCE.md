# Panduan Aplikasi Desktop POS & Integrasi Perangkat Keras

Aplikasi **BukuKasir UMKM** kini beroperasi sebagai **Aplikasi Desktop Native** (berbasis Electron) dengan integrasi langsung perangkat keras kasir toko:
1. **Scanner Barcode Laser**: Mendeteksi tembakan laser berkecepatan tinggi secara global tanpa perlu kursor mengklik kolom cari, lengkap dengan nada konfirmasi *beep*.
2. **Printer Struk Thermal (58mm/80mm)**: Terhubung ke daftar printer sistem operasi Windows dengan kemampuan **Silent Print** (mencetak struk langsung dari tombol tanpa memunculkan kotak dialog peramban).

---

## 1. Menjalankan Aplikasi

- **Cara Cepat**: Klik ganda berkas `start-desktop.bat`.
- **Melalui Terminal**:
  ```bash
  npm start
  ```

---

## 2. Struktur Berkas Desktop & Hardware

| Berkas | Peran |
|---|---|
| `main.js` | Proses utama Electron (membuat jendela aplikasi desktop, IPC deteksi printer Windows, dan IPC cetak latar belakang/silent print) |
| `preload.js` | Jembatan keamanan (`posBridge`) antara Electron dan antarmuka web |
| `start-desktop.bat` | Berkas eksekutabel cepat untuk pengguna Windows |
| `index.html` | Antarmuka kasir, input barcode produk, pengaturan printer sistem |
| `app.js` | Penanganan event scanner laser (HID burst < 80ms), sintetis audio *beep*, dan pemanggilan cetak struk |
| `style.css` | Tata letak desktop POS, notifikasi HUD scanner, dan templat struk thermal 58mm/80mm |

---

## 3. Cara Kerja Integrasi Perangkat Keras

### A. Scanner Barcode Laser (USB / Wireless / Bluetooth)
- Scanner barcode retail bekerja dengan protokol **HID Keyboard Emulation** (mengirim deretan karakter sangat cepat di bawah 60ms dan diakhiri `Enter`).
- Pada `app.js`, fungsi `window.addEventListener('keydown')` memantau jeda waktu penekanan tombol.
- Saat kasir menembakkan laser ke barcode barang:
  1. Sistem otomatis mendeteksi burst ketikan scanner.
  2. Mencocokkan kode dengan daftar produk (`p.barcode` atau `p.id`).
  3. Memasukkan barang ke nota pesanan.
  4. Membunyikan suara *beep* kasir (frekuensi 1760Hz) dan menampilkan notifikasi visual di layar.

### B. Printer Struk Thermal (POS Thermal Printer)
- Saat aplikasi dibuka, Electron memanggil `webContents.getPrintersAsync()` untuk membaca semua printer yang terpasang di Windows (Epson TM series, Xprinter, Panda, VSC, Mini POS USB, dll).
- Di menu **Toko -> Pengaturan Profil Toko dan Perangkat**, pilih nama printer struk Anda dan centang **Cetak Langsung Tanpa Dialog (Silent Print)**.
- Setiap kali transaksi diselesaikan, struk langsung keluar dari mesin cetak thermal secara otomatis.
