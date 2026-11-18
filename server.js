require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const PgStore = require('connect-pg-simple')(session);
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const crypto = require('crypto');
const { pool } = require('./src/db');
const { UPLOAD_DIR } = require('./src/util');
const migrate = require('./src/migrate');

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      'script-src': ["'self'", "'unsafe-inline'", 'https://plausible.io', 'https://www.googletagmanager.com', 'https://www.google-analytics.com'],
      // Font Be Vietnam Pro tự lưu tại /static/fonts, không tải từ Google
      'style-src': ["'self'", "'unsafe-inline'"],
      'font-src': ["'self'", 'data:'],
      'img-src': ["'self'", 'data:', 'blob:', 'https:'],
      'frame-src': ['https://www.google.com', 'https://www.youtube.com', 'https://www.youtube-nocookie.com'],
      'connect-src': ["'self'", 'https://plausible.io', 'https://www.google-analytics.com'],
      'upgrade-insecure-requests': isProd ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false,
}));
// IIS/ARR có thể gửi IP khách kèm số cổng (1.2.3.4:5678, [::1]:5678) trong X-Forwarded-For.
// Bỏ số cổng để giới hạn tần suất (đăng nhập, form liên hệ) tính đúng theo từng IP.
app.use((req, res, next) => {
  const raw = req.ip || '';
  const m = raw.match(/^\[([0-9a-fA-F:.]+)\]:\d+$/) || raw.match(/^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/);
  if (m) Object.defineProperty(req, 'ip', { value: m[1], configurable: true });
  next();
});
// Tắt các quyền trình duyệt website không dùng (camera, micro, vị trí, thanh toán...)
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()');
  next();
});
app.use(compression());
if (process.env.NODE_ENV !== 'test') app.use(morgan(isProd ? 'combined' : 'dev'));

app.use('/static', express.static(path.join(__dirname, 'public'), { maxAge: isProd ? '7d' : 0 }));
app.use('/vendor/quill', express.static(path.join(__dirname, 'node_modules/quill/dist'), { maxAge: '30d' }));
// Tệp tải lên: chặn chạy mã trong SVG
app.use('/uploads', (req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
}, express.static(UPLOAD_DIR, { maxAge: isProd ? '30d' : 0 }));

app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(express.json({ limit: '5mb' }));
app.use(session({
  store: new PgStore({ pool, tableName: 'session' }),
  secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,
  name: 'tt.sid',
  cookie: { httpOnly: true, sameSite: 'lax', secure: isProd && process.env.COOKIE_SECURE !== '0', maxAge: 1000 * 60 * 60 * 8 },
}));

app.use('/quan-tri', require('./src/routes/admin'));
app.use('/', require('./src/routes/public'));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
});

if (require.main === module) {
  migrate().then(() => {
    // HOST=127.0.0.1 khi đặt sau Caddy/IIS để không mở cổng Node ra ngoài
    app.listen(PORT, process.env.HOST || undefined, () => console.log(`Website Tri Thức chạy tại http://localhost:${PORT}  (quản trị: /quan-tri)`));
  }).catch(e => { console.error('Không kết nối được cơ sở dữ liệu:', e.message); process.exit(1); });
}

module.exports = app;
