const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const sanitizeHtml = require('sanitize-html');

function slugify(s) {
  return String(s || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90) || 'muc';
}

function cleanHtml(html) {
  return sanitizeHtml(html || '', {
    allowedTags: ['h2', 'h3', 'h4', 'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'a', 'ul', 'ol', 'li',
      'blockquote', 'pre', 'code', 'img', 'figure', 'figcaption', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'span', 'iframe'],
    allowedAttributes: {
      a: ['href', 'target', 'rel'], img: ['src', 'alt', 'width', 'height', 'loading'],
      iframe: ['src', 'width', 'height', 'allowfullscreen', 'frameborder'], span: ['class'], li: ['data-list'], p: ['class'],
    },
    allowedIframeHostnames: ['www.youtube.com', 'www.youtube-nocookie.com', 'www.google.com'],
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    transformTags: { a: (tag, attribs) => ({ tagName: 'a', attribs: attribs.target === '_blank' ? { ...attribs, rel: 'noopener' } : attribs }) },
  });
}

// Chống giả mạo yêu cầu (CSRF): mỗi phiên một mã, kiểm tra trên mọi POST.
function csrf(req, res, next) {
  if (!req.session.csrf) req.session.csrf = crypto.randomBytes(24).toString('hex');
  res.locals.csrf = req.session.csrf;
  if (req.method === 'POST') {
    const t = (req.body && req.body._csrf) || req.get('x-csrf-token');
    if (!t || t !== req.session.csrf) {
      return res.status(403).send('Phiên làm việc đã hết hạn. Vui lòng tải lại trang và thử lại.');
    }
  }
  next();
}

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
const ALLOWED = {
  'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp', 'image/gif': '.gif',
  'image/svg+xml': '.svg', 'image/x-icon': '.ico', 'image/vnd.microsoft.icon': '.ico', 'application/pdf': '.pdf',
};
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const d = new Date();
      const sub = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      fs.mkdirSync(path.join(UPLOAD_DIR, sub), { recursive: true });
      cb(null, path.join(UPLOAD_DIR, sub));
    },
    filename: (req, file, cb) => {
      const base = slugify(path.parse(file.originalname).name).slice(0, 50);
      cb(null, `${base}-${crypto.randomBytes(4).toString('hex')}${ALLOWED[file.mimetype]}`);
    },
  }),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, !!ALLOWED[file.mimetype]),
});

function publicUploadPath(file) {
  return '/uploads/' + path.relative(UPLOAD_DIR, file.path).split(path.sep).join('/');
}

function fmtDate(d) {
  if (!d) return '';
  const x = new Date(d);
  return `${String(x.getDate()).padStart(2, '0')}/${String(x.getMonth() + 1).padStart(2, '0')}/${x.getFullYear()}`;
}

// Kích thước ảnh (đọc phần đầu tệp PNG, JPEG, GIF, WebP) để ghi width/height vào thẻ <img>,
// giúp trình duyệt giữ chỗ trước khi ảnh tải xong (không xô lệch bố cục, tốt cho Core Web Vitals).
const dimCache = new Map();
function readDim(buf) {
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
  if (buf.length > 10 && buf.toString('ascii', 0, 3) === 'GIF') return [buf.readUInt16LE(6), buf.readUInt16LE(8)];
  if (buf.length > 30 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    const k = buf.toString('ascii', 12, 16);
    if (k === 'VP8X') return [1 + buf.readUIntLE(24, 3), 1 + buf.readUIntLE(27, 3)];
    if (k === 'VP8 ') return [buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff];
    if (k === 'VP8L') { const b = buf.readUInt32LE(21); return [1 + (b & 0x3fff), 1 + ((b >> 14) & 0x3fff)]; }
  }
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) { i++; continue; }
      const m = buf[i + 1];
      if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return [buf.readUInt16BE(i + 7), buf.readUInt16BE(i + 5)];
      i += 2 + buf.readUInt16BE(i + 2);
    }
  }
  return null;
}
function imgDim(url) {
  if (!url || !/^\/uploads\//.test(url) || url.includes('..')) return null;
  if (dimCache.has(url)) return dimCache.get(url);
  let d = null;
  try {
    const f = path.join(UPLOAD_DIR, decodeURIComponent(url.slice('/uploads/'.length)));
    const fd = fs.openSync(f, 'r'); const buf = Buffer.alloc(65536);
    const n = fs.readSync(fd, buf, 0, buf.length, 0); fs.closeSync(fd);
    d = readDim(buf.subarray(0, n));
  } catch { d = null; }
  if (dimCache.size > 2000) dimCache.clear();
  dimCache.set(url, d);
  return d;
}
// Chuỗi thuộc tính width/height cho thẻ <img>, rỗng nếu không đọc được
function wh(url) { const d = imgDim(url); return d && d[0] && d[1] ? ` width="${d[0]}" height="${d[1]}"` : ''; }

module.exports = { slugify, cleanHtml, csrf, upload, UPLOAD_DIR, publicUploadPath, fmtDate, imgDim, wh };
