/**
 * Generator Sertifikat Lisensi Resmi & Surat Aktivasi Toko
 * BukuKasir UMKM - Commercial Sales Kit
 */

const fs = require('fs');
const path = require('path');

const LICENSE_SECRET = 'BK_UMKM_SECURE_SALT_2026_ATNAN49';

function generateLicenseKey(storeName) {
  const cleanName = String(storeName || '').trim().toUpperCase();
  if (!cleanName) return '';

  let h1 = 0xdeadbeef, h2 = 0x41c64e6d;
  const combined = cleanName + LICENSE_SECRET;
  for (let i = 0; i < combined.length; i++) {
    const ch = combined.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0').toUpperCase();
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0').toUpperCase();
  const fullHex = hex1 + hex2;

  return `BKPOS-${fullHex.substring(0, 4)}-${fullHex.substring(4, 8)}-${fullHex.substring(8, 12)}-${fullHex.substring(12, 16)}`;
}

// Tangkap argumen CLI
const args = process.argv.slice(2);
const storeName = args[0] || 'Toko Berkah Bersama';
const customerName = args[1] || 'Pemilik Toko';
const invoiceNumber = args[2] || `INV-${Date.now().toString(36).toUpperCase()}`;
const editionArg = args[3] || 'ultimate';

const EDITIONS = {
  retail: 'Edisi Retail & Sembako (Barcode Laser & Stok Rak)',
  cafe: 'Edisi Kafe & Rumah Makan (Meja, Catatan Menu & Struk Dapur)',
  printing: 'Edisi Percetakan, Fotokopi & Jasa (Jasa Kilat & Sistem DP)',
  ultimate: 'Edisi Ultimate Multi-Usaha (Semua Modul Aktif Terbuka)'
};
const editionName = EDITIONS[editionArg.toLowerCase()] || EDITIONS.ultimate;

const licenseKey = generateLicenseKey(storeName);
const currentDate = new Date().toLocaleDateString('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});

const outputDir = path.join(__dirname, '..', 'paket-penjualan', 'arsip-lisensi');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const safeStoreName = storeName.replace(/[^a-zA-Z0-9_-]/g, '_');
const certificateFileName = `Sertifikat_Lisensi_${safeStoreName}.html`;
const certificateFilePath = path.join(outputDir, certificateFileName);

const certificateHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sertifikat Lisensi Resmi - ${storeName}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
      color: #1e293b;
      background: #f8fafc;
      padding: 24px;
      display: flex;
      justify-content: center;
    }
    .cert-card {
      width: 100%;
      max-width: 720px;
      background: #ffffff;
      border: 2px solid #0f766e;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
      position: relative;
    }
    .cert-header {
      text-align: center;
      border-bottom: 2px dashed #cbd5e1;
      padding-bottom: 24px;
      margin-bottom: 24px;
    }
    .cert-logo {
      font-size: 38px;
      margin-bottom: 6px;
    }
    .cert-brand {
      font-size: 24px;
      font-weight: 800;
      color: #0f766e;
      letter-spacing: 0.05em;
    }
    .cert-subtitle {
      font-size: 13px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-top: 4px;
    }
    .cert-title-badge {
      display: inline-block;
      margin-top: 16px;
      padding: 6px 20px;
      background: #f0fdfa;
      color: #0d9488;
      border: 1px solid #99f6e4;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .cert-body {
      margin-bottom: 30px;
    }
    .cert-greeting {
      font-size: 14px;
      color: #475569;
      line-height: 1.6;
      margin-bottom: 20px;
      text-align: center;
    }
    .info-box {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e2e8f0;
      font-size: 14px;
    }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #64748b; font-weight: 600; }
    .info-val { color: #0f172a; font-weight: 700; text-align: right; }
    .serial-box {
      background: #042f2e;
      color: #5eead4;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin: 24px 0;
    }
    .serial-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #99f6e4;
      margin-bottom: 6px;
    }
    .serial-key {
      font-family: 'Consolas', 'Courier New', monospace;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: 0.12em;
      color: #ffffff;
      user-select: all;
    }
    .activation-steps {
      background: #fffbeb;
      border: 1px solid #fef3c7;
      border-radius: 10px;
      padding: 16px 20px;
      font-size: 13px;
      color: #92400e;
      line-height: 1.5;
    }
    .activation-steps ol {
      margin-left: 20px;
      margin-top: 6px;
    }
    .activation-steps li {
      margin-bottom: 4px;
    }
    .cert-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-top: 1px solid #e2e8f0;
      padding-top: 24px;
      margin-top: 30px;
    }
    .stamp-box {
      border: 2px solid #0f766e;
      color: #0f766e;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      text-align: center;
      transform: rotate(-3deg);
    }
    .sign-box {
      text-align: right;
      font-size: 12px;
      color: #64748b;
    }
    .sign-name {
      font-weight: 700;
      color: #0f172a;
      margin-top: 36px;
      font-size: 13px;
    }
    .btn-print {
      display: block;
      width: 100%;
      background: #0f766e;
      color: #ffffff;
      padding: 12px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      margin-top: 24px;
      text-align: center;
    }
    .btn-print:hover { background: #115e59; }
    @media print {
      body { background: #fff; padding: 0; }
      .cert-card { border: 2px solid #000; box-shadow: none; max-width: 100%; }
      .btn-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="cert-card">
    <div class="cert-header">
      <div class="cert-logo">🏪</div>
      <div class="cert-brand">BUKUKASIR UMKM</div>
      <div class="cert-subtitle">Sistem Kasir POS & Pembukuan Toko Offline</div>
      <div class="cert-title-badge">Sertifikat Lisensi Penggunaan Resmi</div>
    </div>

    <div class="cert-body">
      <p class="cert-greeting">
        Dengan ini dinyatakan bahwa toko di bawah ini telah terdaftar sebagai pengguna resmi perangkat lunak <strong>BukuKasir UMKM</strong> dengan hak pemakaian permanen (seumur hidup).
      </p>

      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Nama Toko Terdaftar</span>
          <span class="info-val">${storeName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Nama Pemilik / Pelanggan</span>
          <span class="info-val">${customerName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Nomor Invoice</span>
          <span class="info-val">${invoiceNumber}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Edisi / Modul Paket</span>
          <span class="info-val" style="color: #0f766e;">${editionName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Tanggal Registrasi</span>
          <span class="info-val">${currentDate}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Masa Berlaku</span>
          <span class="info-val" style="color: #0d9488;">SEUMUR HIDUP (Tanpa Biaya Bulanan)</span>
        </div>
      </div>

      <div class="serial-box">
        <div class="serial-label">Kunci Lisensi Resmi (Serial Key)</div>
        <div class="serial-key">${licenseKey}</div>
      </div>

      <div class="activation-steps">
        <strong>Petunjuk Aktivasi Cepat:</strong>
        <ol>
          <li>Buka aplikasi <strong>BukuKasir UMKM</strong> di Laptop Windows atau HP Android Anda.</li>
          <li>Pada layar penguncian awal, masukkan <strong>Nama Toko</strong> persis: <code>${storeName}</code></li>
          <li>Masukkan <strong>Kunci Lisensi</strong> di atas, lalu klik <strong>Aktivasi Sekarang</strong>.</li>
          <li>Aplikasi langsung terbuka penuh dan siap digunakan transaksi setiap hari secara offline.</li>
        </ol>
      </div>
    </div>

    <div class="cert-footer">
      <div class="stamp-box">
        ✓ RESMI & TERVERIFIKASI<br>
        <span style="font-size:10px; font-weight:normal;">LIFETIME VALIDITY</span>
      </div>
      <div class="sign-box">
        <div>Diterbitkan oleh:</div>
        <div class="sign-name">Tim Pengembang BukuKasir UMKM</div>
        <div>Layanan Dukungan: WhatsApp Resmi Pengembang</div>
      </div>
    </div>

    <button class="btn-print" onclick="window.print()">🖨️ Cetak Sertifikat Ini (A4 / Simpan PDF)</button>
  </div>
</body>
</html>`;

fs.writeFileSync(certificateFilePath, certificateHtml, 'utf8');

console.log('\n================================================================');
console.log('         PEMBUATAN LISENSI RESMI BUKUKASIR UMKM SUKSES');
console.log('================================================================');
console.log(`Nama Toko        : ${storeName}`);
console.log(`Pemilik/Pembeli  : ${customerName}`);
console.log(`Nomor Invoice    : ${invoiceNumber}`);
console.log(`Kunci Lisensi    : ${licenseKey}`);
console.log(`Masa Berlaku     : Seumur Hidup (Lifetime)`);
console.log('----------------------------------------------------------------');
console.log(`Sertifikat Fisik : paket-penjualan/arsip-lisensi/${certificateFileName}`);
console.log('================================================================\n');

// Output JSON ringkas untuk scripting jika diperlukan
const result = {
  storeName,
  customerName,
  invoiceNumber,
  licenseKey,
  certificatePath: certificateFilePath
};
process.stdout.write(JSON.stringify(result));
