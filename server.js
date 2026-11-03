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
      'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
      'img-src': ["'self'", 'data:', 'blob:', 'https:'],
      'frame-src': ['https://www.google.com', 'https://www.youtube.com', 'https://www.youtube-nocookie.com'],
      'connect-src': ["'self'", 'https://plausible.io', 'https://www.google-analytics.com'],
      'upgrade-insecure-requests': isProd ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false,
}));
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
    app.listen(PORT, () => console.log(`Website Tri Thức chạy tại http://localhost:${PORT}  (quản trị: /quan-tri)`));
  }).catch(e => { console.error('Không kết nối được cơ sở dữ liệu:', e.message); process.exit(1); });
}

module.exports = app;
