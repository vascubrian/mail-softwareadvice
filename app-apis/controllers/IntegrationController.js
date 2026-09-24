const { Integration } = require('../models');
const secrets = require('../library/SecretStore');

const providers = ['RESEND', 'OPENAI', 'APOLLO'];
const defaultConfig = {
  RESEND: {},
  OPENAI: { ai_provider: 'openai', model: 'gpt-4.1-mini' },
  APOLLO: {},
};

function environmentKey(provider, config = {}) {
  if (provider === 'OPENAI' && config.ai_provider === 'gemini') return 'GEMINI_API_KEY';
  return { RESEND: 'RESEND_API_KEY', OPENAI: 'OPENAI_API_KEY', APOLLO: 'APOLLO_API_KEY' }[provider];
}

async function keyFor(row, provider) {
  if (row?.secret_value) return secrets.decrypt(row.secret_value);
  return process.env[environmentKey(provider, row?.config)] || '';
}

function cleanConfig(provider, input = {}) {
  if (provider === 'RESEND') return {};
  if (provider === 'OPENAI') {
    const aiProvider = input.ai_provider === 'gemini' ? 'gemini' : 'openai';
    return {
      ai_provider: aiProvider,
      model: String(input.model || (aiProvider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4.1-mini')).trim(),
    };
  }
  return {};
}


exports.list = async (_req, res, next) => {
  try {
    const rows = await Integration.findAll({ where: { deleted: 0 } });
    const byProvider = Object.fromEntries(rows.map(row => [row.provider, row]));
    const data = providers.map(provider => {
      const row = byProvider[provider];
      const raw = row?.toJSON();
      const config = { ...defaultConfig[provider], ...(raw?.config || {}) };
      if (raw) { delete raw.id; delete raw.secret_value; }
      return row
        ? { ...raw, config, has_api_key: Boolean(row.secret_value || process.env[environmentKey(provider, config)]) }
        : { provider, enabled: false, status: process.env[environmentKey(provider, config)] ? 'CONNECTED' : 'NOT_CONNECTED', config, has_api_key: Boolean(process.env[environmentKey(provider, config)]) };
    });
    res.json({ success: true, message: 'Integrations retrieved successfully', data });
  } catch (error) { next(error); }
};

exports.save = async (req, res, next) => {
  try {
    const provider = req.params.provider.toUpperCase();
    if (!providers.includes(provider)) return res.status(404).json({ success: false, message: 'Unknown provider' });
    const config = cleanConfig(provider, req.body.config);
    const existing = await Integration.findOne({ where: { provider } });
    const enabled = provider === 'RESEND' ? true : Boolean(req.body.enabled);
    const values = { enabled, config, status: enabled ? 'NOT_CONNECTED' : 'DISABLED', last_error: null, edited_by: req.user.id, edited_time: new Date() };
    if (String(req.body.api_key || '').trim()) values.secret_value = secrets.encrypt(String(req.body.api_key).trim());
    const row = existing
      ? await existing.update(values)
      : await Integration.create({ provider, ...values, created_by: req.user.id });
    res.json({ success: true, message: provider === 'OPENAI' ? 'AI settings saved' : provider + ' settings saved', data: { provider: row.provider, enabled: row.enabled, status: row.status, config: row.config, has_api_key: Boolean(row.secret_value) } });
  } catch (error) { next(error); }
};

exports.test = async (req, res, next) => {
  try {
    const provider = req.params.provider.toUpperCase();
    if (!providers.includes(provider)) return res.status(404).json({ success: false, message: 'Unknown provider' });
    const row = await Integration.findOne({ where: { provider } });
    const apiKey = await keyFor(row, provider);
    const label = provider === 'OPENAI' ? (row?.config?.ai_provider === 'gemini' ? 'Gemini' : 'OpenAI') : provider === 'RESEND' ? 'Resend' : 'Apollo';
    if (!apiKey) return res.status(422).json({ success: false, message: label + ' API key is not configured' });

    let url;
    const headers = {};
    if (provider === 'RESEND') {
      url = 'https://api.resend.com/domains';
      headers.Authorization = 'Bearer ' + apiKey;
    } else if (provider === 'OPENAI' && row?.config?.ai_provider === 'gemini') {
      url = 'https://generativelanguage.googleapis.com/v1beta/models?pageSize=1';
      headers['x-goog-api-key'] = apiKey;
    } else if (provider === 'OPENAI') {
      url = 'https://api.openai.com/v1/models';
      headers.Authorization = 'Bearer ' + apiKey;
    } else {
      url = 'https://api.apollo.io/v1/auth/health';
      headers['X-Api-Key'] = apiKey;
    }
    const response = await fetch(url, { headers });
    const ok = response.ok;
    let detail = '';
    if (!ok) {
      const body = await response.json().catch(() => ({}));
      detail = body?.error?.message || body?.message || ('HTTP ' + response.status);
    }
    await Integration.update({ status: ok ? 'CONNECTED' : 'CONNECTION_ERROR', last_tested: new Date(), last_error: ok ? null : detail }, { where: { provider } });
    res.status(ok ? 200 : 502).json({ success: ok, message: ok ? label + ' connection successful' : label + ' connection failed: ' + detail });
  } catch (error) { next(error); }
};

