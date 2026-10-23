// Vercel Serverless Function: Create Pakasir v2 Transaction
const SLUG = process.env.PAKASIR_SLUG || 'kasir-umkm';
const API_KEY = process.env.PAKASIR_API_KEY;

const PACKAGES = {
  single: 100000
};

const VOUCHERS = {
  HEMAT15: 15000,
  KASIR85: 15000,
  UMKM85: 15000
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Api-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!API_KEY) {
    return res.status(500).json({ error: 'Konfigurasi PAKASIR_API_KEY belum diatur di server' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { store_name, customer_name, email, package_key, voucher_code, order_id } = body;

    if (!store_name || !String(store_name).trim()) {
      return res.status(400).json({ error: 'Nama toko wajib diisi' });
    }

    const cleanStore = String(store_name).trim();
    const cleanEmail = String(email || '').trim();
    const pkgKey = package_key && PACKAGES[package_key] ? package_key : 'single';
    const basePrice = PACKAGES[pkgKey];
    const cleanVoucher = String(voucher_code || '').trim().toUpperCase();
    const discount = VOUCHERS[cleanVoucher] || 0;
    const cleanAmount = Math.max(1000, basePrice - discount);
    const orderId = order_id || `BK${Date.now().toString(36).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`;

    const response = await fetch(`https://app.pakasir.com/api/v2/create-transaction/${SLUG}/${orderId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': API_KEY
      },
      body: JSON.stringify({
        method: 'qris',
        amount: cleanAmount
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.message || 'Gagal membuat transaksi di Pakasir',
        details: data
      });
    }

    return res.status(200).json({
      success: true,
      txn_id: data.txn_id,
      project: data.project,
      order_id: data.order_id,
      amount: data.amount,
      fee: data.fee,
      total_payment: data.total_payment,
      payment_method: data.payment_method,
      qr_string: data.qr_string,
      expires_at: data.expires_at,
      store_name: cleanStore,
      customer_name: customer_name || '',
      email: cleanEmail
    });
  } catch (err) {
    console.error('Error creating Pakasir transaction:', err);
    return res.status(500).json({
      error: 'Terjadi kesalahan server internal',
      message: err.message
    });
  }
}
