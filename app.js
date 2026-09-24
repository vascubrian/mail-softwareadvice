require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./app-apis/models');
const errorHandler = require('./app-apis/middleware/ErrorHandler');

const app = express();
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '2mb' }));
app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 20 }));
app.get('/api/health', (_req, res) => res.json({ success: true, message: 'API is healthy' }));
app.use('/api/auth', require('./app-apis/routes/auth'));
app.use('/api/leads', require('./app-apis/routes/leads'));
app.use('/api/imports', require('./app-apis/routes/imports'));
app.use('/api/dashboard', require('./app-apis/routes/dashboard'));
app.use('/api/campaigns', require('./app-apis/routes/campaigns'));
app.use('/api/templates', require('./app-apis/routes/templates'));
app.use('/api/emails', require('./app-apis/routes/emails'));
app.use('/api/integrations', require('./app-apis/routes/integrations'));

// Keep unknown API endpoints as JSON responses.
app.use('/api', (_req, res) => res.status(404).json({ success: false, message: 'Endpoint not found' }));

// Serve the prebuilt Vite application so `npm start` runs the complete app.
const clientDirectory = path.join(__dirname, 'dist');
const clientIndex = path.join(clientDirectory, 'index.html');
if (fs.existsSync(clientIndex)) {
  app.use(express.static(clientDirectory));
  app.get('*', (_req, res) => res.sendFile(clientIndex));
} else {
  app.get('*', (_req, res) => res.status(503).json({
    success: false,
    message: 'Frontend build not found. Run npm run build before npm start.',
  }));
}

app.use(errorHandler);

const port = Number(process.env.PORT || 4000);
async function start() {
  try { await sequelize.authenticate(); app.listen(port, () => console.log(`API listening on ${port}`)); }
  catch (error) { console.error('Database connection failed:', error.message); process.exit(1); }
}
if (require.main === module) start();
module.exports = app;
