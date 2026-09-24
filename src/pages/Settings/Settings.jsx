import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getIntegrations, saveIntegration, testIntegration } from '../../services/integrations';
import './Settings.css';

const meta = {
  RESEND: { title: 'Resend', badge: 'Email delivery', description: 'Send campaigns using your verified Resend domain and templates.' },
  OPENAI: { title: 'AI', badge: 'Verification', description: 'Choose OpenAI or Google Gemini for optional lead research and qualification.' },
  APOLLO: { title: 'Apollo', badge: 'Lead discovery', description: 'Connect Apollo to discover and enrich prospects for your campaigns.' },
};

export default function Settings() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [notice, setNotice] = useState({ type: '', text: '' });
  const [working, setWorking] = useState('');
  const load = () => getIntegrations().then(result => setData(result.data)).catch(error => setNotice({ type: 'error', text: error.response?.data?.message || 'Unable to load settings' }));
  useEffect(() => { load(); }, []);
  const update = (provider, key, value) => setData(rows => rows.map(row => row.provider === provider ? { ...row, [key]: value } : row));
  const updateConfig = (provider, key, value) => setData(rows => rows.map(row => row.provider === provider ? { ...row, config: { ...(row.config || {}), [key]: value } } : row));
  const payload = row => ({ enabled: row.provider === 'RESEND' ? true : row.enabled, api_key: row.api_key, config: row.config });
  const save = async row => {
    setWorking('save-' + row.provider); setNotice({ type: '', text: '' });
    try { const result = await saveIntegration(row.provider, payload(row)); setNotice({ type: 'success', text: result.message }); await load(); }
    catch (error) { setNotice({ type: 'error', text: error.response?.data?.message || 'Unable to save settings' }); }
    finally { setWorking(''); }
  };
  const test = async row => {
    setWorking('test-' + row.provider); setNotice({ type: '', text: '' });
    try {
      await saveIntegration(row.provider, payload(row));
      const result = await testIntegration(row.provider);
      setNotice({ type: 'success', text: result.message }); await load();
    } catch (error) { setNotice({ type: 'error', text: error.response?.data?.message || 'Connection failed' }); }
    finally { setWorking(''); }
  };

  return <div className="settings-page">
    <div className="settings-title"><div><p className="settings-kicker">Workspace administration</p><h1>Account settings</h1><p>Manage your account and the services used for lead discovery, AI verification, and email delivery.</p></div></div>
    {notice.text && <div className={'settings-message ' + notice.type}>{notice.text}<button onClick={() => setNotice({ type: '', text: '' })}>×</button></div>}
    <section className="account-card"><div className="account-avatar">{user?.name?.[0]?.toUpperCase() || 'A'}</div><div><span>Signed in as</span><strong>{user?.name || 'Administrator'}</strong><small>{user?.email}</small></div><div className="account-access"><span>Access</span><strong>Administrator</strong><small>Integration secrets are encrypted and never returned to the browser.</small></div></section>
    <div className="settings-section-heading"><div><h2>Connected services</h2><p>Enable only the providers your outreach workflow uses.</p></div><span>{data.filter(row => row.status === 'CONNECTED').length} connected</span></div>
    <div className="integration-grid">{data.map(row => {
      const info = meta[row.provider] || { title: row.provider, badge: 'Integration', description: '' };
      const isAI = row.provider === 'OPENAI';
      return <article key={row.provider} className={row.enabled ? 'enabled' : ''}>
        <header><div className="provider-heading"><span className="provider-mark">{info.title.slice(0, 2).toUpperCase()}</span><div><p>{info.badge}</p><h3>{info.title}</h3></div></div>{row.provider !== 'RESEND' && <label className="switch"><input type="checkbox" checked={Boolean(row.enabled)} onChange={event => update(row.provider, 'enabled', event.target.checked)}/><span/></label>}</header>
        <p className="provider-description">{info.description}</p>
        <div className={'connection-status ' + (row.status || '').toLowerCase()}><i/>{row.status === 'CONNECTED' ? 'Connected' : row.status === 'CONNECTION_ERROR' ? 'Connection error' : row.provider === 'RESEND' ? 'Not configured' : row.enabled ? 'Not tested' : 'Disabled'}</div>
        {isAI && <div className="form-row"><label>AI provider<select value={row.config?.ai_provider || 'openai'} onChange={event => { const value = event.target.value; updateConfig(row.provider, 'ai_provider', value); updateConfig(row.provider, 'model', value === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4.1-mini'); }}><option value="openai">OpenAI</option><option value="gemini">Google Gemini</option></select></label><label>Model<input value={row.config?.model || ''} onChange={event => updateConfig(row.provider, 'model', event.target.value)} placeholder={row.config?.ai_provider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4.1-mini'}/></label></div>}
        <label>API key<div className="secret-input"><input type="password" autoComplete="new-password" value={row.api_key || ''} onChange={event => update(row.provider, 'api_key', event.target.value)} placeholder={row.has_api_key ? 'Saved securely — enter to replace' : 'Enter API key'}/><span>{row.has_api_key ? 'Saved' : 'Required'}</span></div></label>
        {row.provider === 'RESEND' && <p className="field-help resend-template-note">Sender and reply-to details are managed in each published Resend template.</p>}
        <footer><button disabled={Boolean(working)} onClick={() => test(row)}>{working === 'test-' + row.provider ? 'Testing…' : 'Save & test'}</button><button className="primary" disabled={Boolean(working)} onClick={() => save(row)}>{working === 'save-' + row.provider ? 'Saving…' : 'Save changes'}</button></footer>
      </article>;
    })}</div>
  </div>;
}
