import api from './api';
export const getLeads = (params) => api.get('/leads', { params }).then((r) => r.data);
export const getLead = (key) => api.get(`/leads/${key}`).then((r) => r.data);
export const saveLead = (data, key) => api[key ? 'put' : 'post'](key ? `/leads/${key}` : '/leads', data).then((r) => r.data);
export const deleteLead = (key) => api.delete(`/leads/${key}`).then((r) => r.data);
