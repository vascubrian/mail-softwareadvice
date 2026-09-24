const XLSX = require('xlsx');
const aliases = {
  name: ['name','full name','contact name'], first_name: ['first name','firstname','given name'], last_name: ['last name','lastname','surname'],
  job_title: ['job title','title','position'], company: ['company','company name','organization'], email: ['email','email address','work email'],
  linkedin_url: ['linkedin account','linkedin url','linkedin','linkedin profile'], phone: ['phone','phone number','mobile'], country: ['country','location'],
  company_size: ['company size','employees','employee count'], industry: ['industry'], company_website: ['website','company website','domain']
};
const normalize = (value) => String(value || '').trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
exports.suggestMapping = (columns) => Object.fromEntries(columns.map((column) => [column, Object.entries(aliases).find(([, names]) => names.includes(normalize(column)))?.[0] || '']));
exports.parse = (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: false });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
  return { columns: rows.length ? Object.keys(rows[0]) : [], rows: rows.slice(0, 10000) };
};
exports.mapRows = (rows, mapping) => rows.map((row) => Object.fromEntries(Object.entries(mapping).filter(([, target]) => target).map(([column, target]) => [target, String(row[column] ?? '').trim()])));
