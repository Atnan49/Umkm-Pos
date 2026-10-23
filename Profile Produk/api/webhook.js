// Vercel Serverless Function: Pakasir Webhook Handler
const EXPECTED_SECRET = process.env.PAKASIR_WEBHOOK_SECRET;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Secret');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const incomingSecret = req.headers['x-secret'] || req.headers['X-Secret'];
  if (!EXPECTED_SECRET || incomingSecret !== EXPECTED_SECRET) {
    console.warn('[Webhook Pakasir] Invalid or unconfigured secret received');
    return res.status(401).json({ error: 'Unauthorized secret' });
  }

  const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  console.log('[Webhook Pakasir Received]', {
    txn_id: payload.txn_id,
    order_id: payload.order_id,
    amount: payload.amount,
    status: payload.status,
    completed_at: payload.completed_at
  });

  // Pakasir requires HTTP 200 OK
  return res.status(200).json({
    status: 'ok',
    message: 'Webhook processed successfully'
  });
}
