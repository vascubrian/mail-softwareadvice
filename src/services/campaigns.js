import api from './api';export const getCampaigns=()=>api.get('/campaigns').then(r=>r.data);export const saveCampaign=(data,key)=>api[key?'put':'post'](key?`/campaigns/${key}`:'/campaigns',data).then(r=>r.data);

export const sendCampaign=(key,confirm)=>api.post(`/campaigns/${key}/send`,{confirm}).then(r=>r.data);
