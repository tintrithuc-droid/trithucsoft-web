// Tạo bảng và nạp dữ liệu mẫu ban đầu (chỉ nạp một lần).
// Chạy: npm run migrate
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { pool, q, one } = require('./db');

async function migrate({ seed = true } = {}) {
  await pool.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
  if (!seed) return;
  const seeded = await one("SELECT value FROM settings WHERE key = '_seeded'");
  if (seeded) return;
  await require('./seed')(q);
  const userCount = await one('SELECT count(*)::int AS n FROM users');
  if (userCount.n === 0) {
    const email = process.env.ADMIN_EMAIL || 'admin@trithucsoft.vn';
    const pass = process.env.ADMIN_PASSWORD || crypto.randomBytes(9).toString('base64url');
    await q('INSERT INTO users(email, name, password_hash, role) VALUES ($1,$2,$3,$4)',
      [email.toLowerCase(), 'Quản trị viên', await bcrypt.hash(pass, 12), 'admin']);
    console.log('\n=== Tài khoản quản trị đầu tiên ===');
    console.log('Email:    ' + email);
    console.log('Mật khẩu: ' + (process.env.ADMIN_PASSWORD ? '(theo biến ADMIN_PASSWORD)' : pass));
    console.log('Hãy đổi mật khẩu sau khi đăng nhập.\n');
  }
  await q("INSERT INTO settings(key, value) VALUES ('_seeded', '1') ON CONFLICT DO NOTHING");
}

module.exports = migrate;

if (require.main === module) {
  migrate().then(() => { console.log('Đã cập nhật cơ sở dữ liệu.'); return pool.end(); })
    .catch(e => { console.error(e); process.exit(1); });
}
