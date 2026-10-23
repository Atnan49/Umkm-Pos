// Vercel Serverless Function: Check Pakasir v2 Transaction Status & Issue License Key
const SLUG = process.env.PAKASIR_SLUG || 'kasir-umkm';
const API_KEY = process.env.PAKASIR_API_KEY;
const LICENSE_SECRET = process.env.LICENSE_SECRET || 'BK_UMKM_SECURE_SALT_2026_ATNAN49';

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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!API_KEY) {
    return res.status(500).json({ error: 'Konfigurasi PAKASIR_API_KEY belum diatur di server' });
  }

  const txn_id = req.query?.txn_id || (typeof req.body === 'object' ? req.body?.txn_id : null);
  const store_name = req.query?.store_name || (typeof req.body === 'object' ? req.body?.store_name : '');

  if (!txn_id) {
    return res.status(400).json({ error: 'Parameter txn_id wajib disertakan' });
  }

  try {
    const response = await fetch(`https://app.pakasir.com/api/v2/transaction-status/${SLUG}/${encodeURIComponent(txn_id)}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': API_KEY
      }
    });

    const data = await response.json();
    if (response.ok && data.status === 'completed' && store_name) {
      data.license_key = generateLicenseKey(store_name);
    }
    return res.status(response.status).json(data);
  } catch (err) {
    console.error('Error checking Pakasir transaction status:', err);
    return res.status(500).json({
      error: 'Gagal mengecek status transaksi',
      message: err.message
    });
  }
}
