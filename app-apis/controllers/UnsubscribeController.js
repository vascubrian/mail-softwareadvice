const jwt = require('jsonwebtoken');
const { Lead } = require('../models');

exports.unsubscribe = async (req, res) => {
  try {
    const payload = jwt.verify(req.params.token, process.env.AUTH_SECRET);
    if (payload.purpose !== 'unsubscribe' || !payload.lead_key) throw new Error('Invalid purpose');
    const lead = await Lead.findOne({ where: { public_key: payload.lead_key, email: payload.email, deleted: 0 } });
    if (!lead) return render(res, 404, 'Link not found', 'This unsubscribe link is no longer valid.');
    if (lead.status !== 'UNSUBSCRIBED') await lead.update({ status: 'UNSUBSCRIBED', edited_time: new Date() });
    return render(res, 200, 'You are unsubscribed', 'You will no longer receive outreach emails from Mail Software Advice.');
  } catch (_error) {
    return render(res, 400, 'Invalid unsubscribe link', 'This link is invalid or has been changed.');
  }
};

function render(res, status, title, message) {
  return res.status(status).type('html').send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>body{margin:0;background:#f6f7fb;color:#17182f;font-family:Inter,Arial,sans-serif}.card{width:min(520px,calc(100% - 40px));margin:12vh auto;padding:42px;box-sizing:border-box;border:1px solid #e1e3ec;border-radius:18px;background:#fff;box-shadow:0 18px 50px rgba(30,32,70,.08);text-align:center}.mark{width:54px;height:54px;display:grid;place-items:center;margin:0 auto 20px;border-radius:50%;background:#eaf8f5;color:#168b75;font-size:26px}h1{margin:0 0 12px;font-size:28px}p{margin:0;color:#6f7383;line-height:1.7}</style></head><body><main class="card"><div class="mark">✓</div><h1>${title}</h1><p>${message}</p></main></body></html>`);
}
