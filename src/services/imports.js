import api from './api';
export const previewImport = (file) => { const data = new FormData(); data.append('file', file); return api.post('/imports/preview', data).then((r) => r.data); };
export const remapImport = (rawRows, mapping) => api.post('/imports/remap', { rawRows, mapping }).then((r) => r.data);
export const confirmImport = (payload) => api.post('/imports/confirm', payload).then((r) => r.data);
export const getImports = () => api.get('/imports').then((r) => r.data);
