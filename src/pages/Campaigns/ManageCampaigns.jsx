import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AddRounded, ContentCopyRounded, DeleteOutlineRounded } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Snackbar, Tooltip, Typography } from '@mui/material';
import { deleteCampaign, getCampaigns } from '../../services/campaigns';
import './CampaignWizard.css';

export default function ManageCampaigns() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => getCampaigns()
    .then(result => setRows(result.data))
    .catch(requestError => setError(requestError.response?.data?.message || 'Unable to load campaigns'));

  useEffect(() => { load(); }, []);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCampaign(deleteTarget.public_key);
      setRows(current => current.filter(item => item.public_key !== deleteTarget.public_key));
      setNotice('Campaign deleted successfully');
      setDeleteTarget(null);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete campaign');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return <div className="campaign-page">
    <header>
      <div><p className="page-kicker">Outreach</p><h1>Campaigns</h1><p>Create a new campaign or reuse a previous audience and template.</p></div>
      <Link to="/app/campaigns/new" className="campaign-create"><AddRounded fontSize="small"/><span>Create campaign</span></Link>
    </header>
    {error && <div className="wizard-error">{error}</div>}
    <section className="campaign-list-card">
      <div className="campaign-list-row campaign-list-head"><span>Template</span><span>Source</span><span>Leads</span><span>Sent</span><span>Status</span><span>Actions</span></div>
      {rows.length === 0
        ? <div className="campaign-list-empty"><strong>No campaigns yet</strong><p>Create your first draft and begin outreach.</p><Link to="/app/campaigns/new">Create campaign →</Link></div>
        : rows.map(item => <div className="campaign-list-row" key={item.public_key}>
          <strong>{item.template_name || 'Template not selected'}</strong>
          <span>{item.source}</span><span>{item.total_leads}</span><span>{item.emails_sent || 0}</span>
          <span><i className={'campaign-status status-' + String(item.status || 'draft').toLowerCase()}>{item.status}</i></span>
          <span className="campaign-row-actions">
            <Tooltip title={item.status === 'COMPLETED' ? 'Reuse sent campaign' : 'Reuse campaign'}>
              <IconButton component={Link} to={'/app/campaigns/new?reuse=' + item.public_key} size="small" aria-label="Reuse campaign"><ContentCopyRounded fontSize="small"/></IconButton>
            </Tooltip>
            <Tooltip title="Delete campaign">
              <IconButton size="small" color="error" aria-label="Delete campaign" onClick={() => setDeleteTarget(item)}><DeleteOutlineRounded fontSize="small"/></IconButton>
            </Tooltip>
          </span>
        </div>)}
    </section>
    <Dialog open={Boolean(deleteTarget)} onClose={() => !deleting && setDeleteTarget(null)} fullWidth maxWidth="xs">
      <DialogTitle>Delete campaign?</DialogTitle>
      <DialogContent><Typography color="text.secondary">This removes the campaign record for <strong>{deleteTarget?.template_name || 'this campaign'}</strong>. Existing email activity remains available.</Typography></DialogContent>
      <DialogActions><Button onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button><Button variant="contained" color="error" onClick={confirmDelete} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete campaign'}</Button></DialogActions>
    </Dialog>
    <Snackbar open={Boolean(notice)} autoHideDuration={3000} onClose={() => setNotice('')} message={notice}/>
  </div>;
}
