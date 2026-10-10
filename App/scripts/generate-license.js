/**
 * Generator Kunci Lisensi Resmi BukuKasir UMKM
 * Digunakan oleh pemilik software untuk membuat lisensi resmi toko pembeli.
 *
 * Penggunaan:
 * node scripts/generate-license.js "Nama Toko Pembeli"
 */

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

const inputStoreName = process.argv.slice(2).join(' ') || 'Toko Berkah Bersama';
const generatedKey = generateLicenseKey(inputStoreName);

console.log('\n======================================================');
console.log('       GENERATOR LISENSI RESMI BUKUKASIR UMKM');
console.log('======================================================');
console.log(`Nama Toko    : ${inputStoreName}`);
console.log(`Kunci Lisensi: ${generatedKey}`);
console.log('Masa Berlaku : Seumur Hidup (Lifetime Offline Lock)');
console.log('======================================================\n');
