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

module.exports = { slugify, cleanHtml, csrf, upload, UPLOAD_DIR, publicUploadPath, fmtDate };
