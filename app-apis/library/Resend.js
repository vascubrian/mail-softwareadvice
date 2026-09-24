const { Integration } = require('../models');
const secrets = require('./SecretStore');

async function settings() {
  const row = await Integration.findOne({ where: { provider: 'RESEND', deleted: 0 } });
  const apiKey = row?.secret_value
    ? secrets.decrypt(row.secret_value)
    : process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw Object.assign(new Error('Resend is not configured'), {
      status: 422,
      publicMessage: 'Configure and test Resend before sending',
    });
  }
  return { apiKey };
}

async function request(path, apiKey, options = {}) {
  const response = await fetch(`https://api.resend.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw Object.assign(new Error(body.message || `Resend HTTP ${response.status}`), {
      providerStatus: response.status,
    });
  }
  return body;
}

exports.sendTemplate = async ({ to, templateId, lead, idempotencyKey }) => {
  const config = await settings();
  const available = {
    name: lead.name || [lead.first_name, lead.last_name].filter(Boolean).join(' ') || '',
    company_name: lead.company || '',
  };

  const template = await request(`/templates/${encodeURIComponent(templateId)}`, config.apiKey);
  if (template.status && template.status !== 'published') {
    throw new Error('Resend template is not published: ' + templateId);
  }

  const variables = {
    name: available.name,
    company_name: available.company_name,
  };

  return request('/emails', config.apiKey, {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify({
      to: [to],
      template: { id: templateId, variables },
    }),
  });
};

