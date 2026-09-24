require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('../app-apis/models');
const [,, name, email, password] = process.argv;
if (!name || !email || !password || password.length < 8) { console.error('Usage: npm run user:create -- "Admin Name" admin@example.com password-min-8'); process.exit(1); }
(async () => { try { await sequelize.sync(); const password_hash = await bcrypt.hash(password, 12); const [user, created] = await User.findOrCreate({ where: { email: email.toLowerCase() }, defaults: { name, email: email.toLowerCase(), password_hash } }); if (!created) await user.update({ name, password_hash, active: true, deleted: 0 }); console.log(created ? 'User created' : 'User password updated'); } catch (e) { console.error(e.message); process.exitCode = 1; } finally { await sequelize.close(); } })();
