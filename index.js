// Vercel serverless function: forwards requests from the website to your Google Apps Script.
// Keeps your Apps Script URL and secret hidden from the browser.
const ALLOWED = ['signupSendOtp', 'signupVerify', 'loginSendOtp', 'loginVerify',
                 'getDashboard', 'updateName', 'logout'];

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const url = process.env.APPS_SCRIPT_URL;
  const secret = process.env.API_SECRET;
  if (!url || !secret) return res.status(500).json({ ok: false, error: 'Server is not configured yet.' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  body = body || {};
  if (!ALLOWED.includes(body.action)) return res.status(400).json({ ok: false, error: 'Bad request' });

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ ...body, secret }),
      redirect: 'follow'
    });
    const text = await r.text();
    return res.status(200).json(JSON.parse(text));
  } catch (e) {
    return res.status(502).json({ ok: false, error: 'Could not reach the database. Please try again.' });
  }
};
