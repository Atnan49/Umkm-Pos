# Strategi Penjualan Produk Modular: BukuKasir UMKM
## Edisi Khusus Industri: Kafe/Resto, Percetakan/Fotokopi, dan Retail

---

## 1. Latar Belakang & Nilai Tambah

Menjual satu aplikasi POS yang "terlalu umum" sering membuat calon pembeli ragu karena merasa fiturnya tidak sesuai dengan alur bisnis mereka:
* **Pemilik Kafe / Warung Makan**: "Bisa catat nomor meja nggak? Bisa pesan dine-in atau bungkus? Bisa kasih catatan menu seperti es sedikit / pedas?"
* **Pemilik Percetakan / Fotokopi**: "Barang kami custom (ukuran meteran/lembaran), bisa hitung jasa langsung tanpa input barcode? Bisa catat DP / Uang Muka saat pelanggan pesan banner?"
* **Pemilik Toko Retail / Sembako**: "Butuh scanner cepat dan cetak label rak."

Dengan menghadirkan **Modul Khusus Industri**, kita bisa:
1. **Menaikkan Harga Jual (Higher Average Order Value)** dari Rp 149.000 menjadi Rp 229.000 – Rp 299.000.
2. **Target Iklan Lebih Tajam**: Bisa buat iklan khusus untuk pemilik warung kopi / kafe, dan iklan terpisah untuk pemilik usaha fotokopi/digital printing.
3. **Membuka Peluang Upselling**: Pembeli awal bisa membeli lisensi modul tambahan jika usahanya berkembang.

---

## 2. Rincian Fitur Per Modul

### A. Modul 1: Kafe & Rumah Makan (F&B / Resto Edition)
* **Pilihan Meja & Tipe Pesanan**:
  - Tombol instan: `Makan di Tempat (Dine-In)` atau `Bungkus (Take-Away)`.
  - Input `Nomor Meja` (misal: Meja 05, Lesehan 2, VIP).
* **Catatan Khusus Per Menu**:
  - Tombol catatan per item pesanan (Contoh: *"Es sedikit"*, *"Manis sedang"*, *"Tanpa daun bawang"*, *"Pedas level 5"*).
* **Cetak Struk Khusus**:
  - Di struk kasir tercetak jelas Nomor Meja & Keterangan Khusus.
  - Fitur **Cetak Salinan Dapur / Bar** (Kitchen Ticket) tanpa mencantumkan nominal harga, khusus untuk koki/barista.

### B. Modul 2: Percetakan, Fotokopi & Jasa (Printing & Services Edition)
* **Input Jasa Kilat (Quick Custom Order)**:
  - Tombol cepat untuk memasukkan pesanan custom tanpa harus mendaftarkan barang terlebih dahulu di inventaris (Contoh: *"Cetak Spanduk 3x1m"*, *"Fotokopi 250 Lembar"*, *"Jilid Skripsi Hardcover"*).
* **Sistem Uang Muka (DP) & Pelunasan**:
  - Pilihan status pembayaran: `Lunas` atau `Uang Muka (DP)`.
  - Sistem otomatis menghitung `Sisa Tagihan` yang harus dibayar saat pesanan diambil.
  - Struk mencantumkan: `Total Tagihan`, `DP Diterima`, `Sisa Tagihan yang Belum Lunas`.
* **Nomor HP / Catatan Pengambilan Pelanggan**:
  - Tertera di nota agar mudah dihubungi saat pesanan selesai dicetak.

### C. Modul 3: Toko Retail & Sembako (Retail Edition - Standar)
* Barcode laser scanner burst global (< 85ms).
* Cetak stiker label harga rak barcode Code 128.
* Manajemen stok aman vs perlu kulakan.
* Validasi harga modal (HPP) dan margin keuntungan.

---

## 3. Strategi Harga & Paket Penjualan

| Paket Lisensi | Fitur yang Didapat | Harga Sekali Bayar |
|---|---|---|
| **Edisi Retail Sembako** | Modul Toko Retail + Barcode Scanner + Label Rak | **Rp 149.000** |
| **Edisi Kafe & Kuliner** | Modul Toko + Nomor Meja + Catatan Menu + Dine-in/Take-away + Struk Dapur | **Rp 229.000** |
| **Edisi Percetakan & Jasa** | Modul Toko + Input Jasa Kilat + Sistem DP/Pelunasan + Nota Order | **Rp 229.000** |
| **Paket Ultimate All-in-One** | **SEMUA MODUL TERBUKA (Retail + F&B + Percetakan)** | **Rp 299.000** |
| **Add-on Upgrade Modul** | Tambah modul kafe atau percetakan bagi pengguna lama | **Rp 89.000** |

---

## 4. Struktur Data Teknis (Implementation Spec)

1. **Konfigurasi Toko (`Store.outlet`)**:
   ```javascript
   businessMode: 'all' // Pilihan: 'retail' | 'cafe' | 'services' | 'all'
   ```
2. **Item Keranjang (`Store.cart`)**:
   ```javascript
   {
     productId: 'PRD-1',
     qty: 2,
     customName: 'Cetak Spanduk Flexi 3x1m', // jika custom item jasa
     customPrice: 45000,
     note: 'Less ice, gula aren pisah' // catatan per menu F&B
   }
   ```
3. **Data Transaksi (`transaction`)**:
   ```javascript
   {
     id: 'TRX-...',
     orderType: 'dine_in', // 'dine_in' | 'take_away' | 'pickup' | 'delivery'
     tableNumber: 'Meja 03',
     paymentStatus: 'dp', // 'paid' | 'dp'
     downPayment: 50000,
     remainingPayment: 25000,
     ...
   }
   ```
