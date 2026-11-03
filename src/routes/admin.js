const express = require('express');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { q, one } = require('../db');
const { GROUPS, getSettings, saveSettings } = require('../settings');
const { RESOURCES } = require('../resources');
const { icon } = require('../icons');
const { slugify, cleanHtml, csrf, upload, publicUploadPath, fmtDate } = require('../util');

const router = express.Router();

router.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.locals.flash = req.session.flash; delete req.session.flash;
  res.locals.me = req.session.user || null;
  res.locals.RESOURCES = RESOURCES;
  res.locals.icon = icon;
  res.locals.fmtDate = fmtDate;
  res.locals.reqPath = req.path;
  next();
});
router.param('id', (req, res, next, id) => /^\d+$/.test(id) ? next() : next('route'));
const flash = (req, type, text) => { req.session.flash = { type, text }; };

// ---------- Đăng nhập ----------
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false,
  handler: (req, res) => res.status(429).send('Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút.') });

router.get('/dang-nhap', csrf, (req, res) => res.render('admin/login', { error: null, email: '' }));
router.post('/dang-nhap', loginLimiter, csrf, async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const u = await one('SELECT * FROM users WHERE email=$1 AND active', [email]);
    if (!u || !(await bcrypt.compare(String(req.body.password || ''), u.password_hash))) {
      return res.status(401).render('admin/login', { error: 'Email hoặc mật khẩu không đúng.', email });
    }
    req.session.regenerate(err => {
      if (err) return next(err);
      req.session.user = { id: u.id, email: u.email, name: u.name, role: u.role };
      q('UPDATE users SET last_login_at=now() WHERE id=$1', [u.id]).catch(() => {});
      res.redirect('/quan-tri');
    });
  } catch (e) { next(e); }
});

router.use((req, res, next) => {
  if (!req.session.user) return res.redirect('/quan-tri/dang-nhap');
  next();
});

// Tệp gửi kèm form được nhận trước, rồi mới kiểm tra mã CSRF; sai mã thì xóa tệp.
router.use(upload.any(), (req, res, next) => {
  csrf(req, res, err => {
    if (err) return next(err);
    next();
  });
  if (res.headersSent && req.files) req.files.forEach(f => fs.unlink(f.path, () => {}));
});

router.post('/dang-xuat', (req, res) => req.session.destroy(() => res.redirect('/quan-tri/dang-nhap')));

const adminOnly = (req, res, next) => req.session.user.role === 'admin' ? next() : res.status(403).send('Chỉ quản trị viên được dùng chức năng này.');

async function recordMedia(files) {
  for (const f of files || []) {
    await q('INSERT INTO media(path, original_name, mime, size) VALUES ($1,$2,$3,$4)', [publicUploadPath(f), f.originalname, f.mimetype, f.size]);
  }
}
const fileFor = (req, name) => (req.files || []).find(f => f.fieldname === '__file_' + name);

// ---------- Tổng quan ----------
router.get('/', async (req, res, next) => {
  try {
    const counts = {};
    for (const k of ['solutions', 'projects', 'posts', 'clients', 'pages', 'banners']) {
      counts[k] = (await one(`SELECT count(*)::int AS n FROM ${RESOURCES[k].table}`)).n;
    }
    const leadsNew = (await one("SELECT count(*)::int AS n FROM leads WHERE status='new'")).n;
    const leads = await q('SELECT * FROM leads ORDER BY created_at DESC LIMIT 6');
    // Liệt kê nội dung còn chỗ giữ chỗ [ ... ] cần cập nhật
    const todo = [];
    const s = await getSettings();
    GROUPS.forEach(g => g.fields.forEach(f => { if (String(s[f.key] || '').includes('[')) todo.push({ label: `Cấu hình: ${f.label}`, url: `/quan-tri/cau-hinh?tab=${g.id}` }); }));
    for (const [key, r] of Object.entries(RESOURCES)) {
      if (key === 'users') continue;
      const textCols = r.fields.filter(f => ['text', 'textarea', 'richtext', 'repeater', 'slug'].includes(f.type)).map(f => f.name);
      if (!textCols.length) continue;
      const titleCol = r.list[0];
      const activeCond = r.fields.some(f => f.name === 'active') ? 'active AND ' : (key === 'posts' ? "status='published' AND " : '');
      const rows = await q(`SELECT id, ${titleCol} AS t FROM ${r.table} WHERE ${activeCond}(${textCols.map(c => `${c}::text LIKE '%[%'`).join(' OR ')}) ORDER BY id`);
      rows.forEach(x => todo.push({ label: `${r.label}: ${String(x.t).slice(0, 80)}`, url: `/quan-tri/r/${key}/${x.id}` }));
    }
    res.render('admin/dashboard', { counts, leadsNew, leads, todo });
  } catch (e) { next(e); }
});

// ---------- Cấu hình website ----------
router.get('/cau-hinh', adminOnly, async (req, res, next) => {
  try {
    const tab = GROUPS.find(g => g.id === req.query.tab) ? req.query.tab : GROUPS[0].id;
    res.render('admin/settings', { groups: GROUPS, tab, s: await getSettings() });
  } catch (e) { next(e); }
});
router.post('/cau-hinh', adminOnly, async (req, res, next) => {
  try {
    const g = GROUPS.find(x => x.id === req.body._tab);
    if (!g) return res.redirect('/quan-tri/cau-hinh');
    const out = {};
    for (const f of g.fields) {
      let v = req.body[f.key];
      if (Array.isArray(v)) v = v[v.length - 1];
      if (f.type === 'checkbox') v = v ? '1' : '0';
      if (f.type === 'image') {
        const file = fileFor(req, f.key);
        if (file) v = publicUploadPath(file);
        if (req.body['__clear_' + f.key]) v = '';
      }
      if (f.type === 'color' && !/^#[0-9a-fA-F]{3,8}$/.test(v || '')) v = f.def;
      out[f.key] = String(v ?? '').replace(/\r\n?/g, '\n').trim();
    }
    await recordMedia(req.files);
    await saveSettings(out);
    flash(req, 'ok', `Đã lưu "${g.label}". Thay đổi hiển thị ngay trên website.`);
    res.redirect('/quan-tri/cau-hinh?tab=' + g.id);
  } catch (e) { next(e); }
});

// ---------- Nội dung (tự sinh từ cấu hình) ----------
function getRes(req, res, next) {
  const r = RESOURCES[req.params.res];
  if (!r) return res.status(404).send('Không có mục này.');
  if (r.adminOnly && req.session.user.role !== 'admin') return res.status(403).send('Chỉ quản trị viên được dùng chức năng này.');
  req.R = r; res.locals.R = r; res.locals.resKey = req.params.res;
  next();
}

router.get('/r/:res', getRes, async (req, res, next) => {
  try {
    const R = req.R;
    const where = []; const params = [];
    const filter = R.filter && req.query[R.filter.name];
    if (filter) { params.push(filter); where.push(`${R.filter.name}=$${params.length}`); }
    const kw = String(req.query.tim || '').trim();
    if (kw) {
      params.push('%' + kw + '%');
      const cols = R.search || [R.list[0]];
      where.push('(' + cols.map(c => `${c} ILIKE $${params.length}`).join(' OR ') + ')');
    }
    const rows = await q(`SELECT * FROM ${R.table} ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY ${R.order} LIMIT 500`, params);
    res.render('admin/list', { rows, filter, kw });
  } catch (e) { next(e); }
});

async function datalists() {
  const pc = (await q("SELECT DISTINCT category FROM posts WHERE category<>'' ORDER BY 1")).map(r => r.category);
  const jc = (await q("SELECT DISTINCT category FROM projects WHERE category<>'' ORDER BY 1")).map(r => r.category);
  return { post_categories: [...new Set(['Tin về Tri Thức', 'Hoạt động tư vấn', 'Phát triển phần mềm', ...pc])], project_categories: jc };
}

router.get('/r/:res/moi', getRes, async (req, res, next) => {
  try {
    const item = { active: true, featured: true, sort: 0, status: 'draft', published_at: new Date() };
    if (req.R.filter && req.query[req.R.filter.name]) item[req.R.filter.name] = req.query[req.R.filter.name];
    req.R.fields.filter(f => f.type === 'repeater').forEach(f => { item[f.name] = []; });
    res.render('admin/form', { item, isNew: true, lists: await datalists(), errors: [] });
  } catch (e) { next(e); }
});

router.get('/r/:res/:id', getRes, async (req, res, next) => {
  try {
    const item = await one(`SELECT * FROM ${req.R.table} WHERE id=$1`, [req.params.id]);
    if (!item) return res.redirect('/quan-tri/r/' + req.params.res);
    res.render('admin/form', { item, isNew: false, lists: await datalists(), errors: [] });
  } catch (e) { next(e); }
});

function readField(f, req) {
  let v = req.body[f.name];
  if (Array.isArray(v)) v = v[v.length - 1];
  switch (f.type) {
    case 'checkbox': return !!v;
    case 'number': return parseInt(v, 10) || 0;
    case 'datetime': { const d = v ? new Date(v) : new Date(); return isNaN(d) ? new Date() : d; }
    case 'richtext': return cleanHtml(v);
    case 'repeater': {
      let arr = [];
      try { arr = JSON.parse(v || '[]'); } catch (e) { arr = []; }
      if (!Array.isArray(arr)) arr = [];
      return arr.map(o => { const r = {}; f.sub.forEach(sf => { r[sf.name] = String((o && o[sf.name]) || '').trim().slice(0, 3000); }); return r; })
        .filter(o => Object.values(o).some(Boolean));
    }
    case 'select': return f.options.some(o => o.value === v) ? v : f.options[0].value;
    case 'image': case 'file': {
      const file = fileFor(req, f.name);
      if (file) return publicUploadPath(file);
      if (req.body['__clear_' + f.name]) return '';
      return String(v || '').trim();
    }
    default: return String(v ?? '').replace(/\r\n?/g, '\n').trim();
  }
}

router.post('/r/:res/luu', getRes, async (req, res, next) => {
  const R = req.R;
  const id = parseInt(req.body._id, 10) || null;
  const data = {}; const errors = [];
  try {
    for (const f of R.fields) {
      if (f.type === 'password') continue;
      data[f.name] = readField(f, req);
      if (f.required && (data[f.name] === '' || data[f.name] == null)) errors.push(`Vui lòng nhập "${f.label}".`);
    }
    if (R.slugFrom) {
      data.slug = slugify(data.slug || data[R.slugFrom]);
      const dup = await one(`SELECT id FROM ${R.table} WHERE slug=$1 AND id<>$2`, [data.slug, id || 0]);
      if (dup) errors.push(`Đường dẫn "${data.slug}" đã được dùng. Vui lòng đổi đường dẫn khác.`);
      if (R.table === 'pages' && ['giai-phap', 'du-an', 'tin-tuc', 'lien-he', 'quan-tri', 'sitemap.xml', 'robots.txt', 'llms.txt', 'static', 'uploads'].includes(data.slug)) {
        errors.push(`Đường dẫn "${data.slug}" trùng với trang hệ thống.`);
      }
    }
    if (R.table === 'users') {
      data.email = String(data.email).toLowerCase();
      const pw = String(req.body.password || '');
      if (pw && pw.length < 10) errors.push('Mật khẩu cần tối thiểu 10 ký tự.');
      if (!id && !pw) errors.push('Vui lòng đặt mật khẩu cho tài khoản mới.');
      if (pw) data.password_hash = await bcrypt.hash(pw, 12);
      const dup = await one('SELECT id FROM users WHERE email=$1 AND id<>$2', [data.email, id || 0]);
      if (dup) errors.push('Email này đã có tài khoản.');
      if (id && (data.role !== 'admin' || !data.active)) {
        const others = await one("SELECT count(*)::int AS n FROM users WHERE role='admin' AND active AND id<>$1", [id]);
        if (others.n === 0) errors.push('Phải giữ ít nhất một quản trị viên đang hoạt động.');
      }
    }
    if (errors.length) {
      req.files && req.files.forEach(f => fs.unlink(f.path, () => {}));
      return res.status(422).render('admin/form', { item: { ...data, id }, isNew: !id, lists: await datalists(), errors });
    }
    await recordMedia(req.files);
    if (['solutions', 'projects', 'posts', 'pages'].includes(R.table)) data.updated_at = new Date();
    const keys = Object.keys(data);
    const vals = keys.map(k => (Array.isArray(data[k]) ? JSON.stringify(data[k]) : data[k]));
    let saved;
    if (id) {
      saved = await one(`UPDATE ${R.table} SET ${keys.map((k, i) => `${k}=$${i + 1}`).join(', ')} WHERE id=$${keys.length + 1} RETURNING id`, [...vals, id]);
    } else {
      saved = await one(`INSERT INTO ${R.table}(${keys.join(',')}) VALUES (${keys.map((_, i) => '$' + (i + 1)).join(',')}) RETURNING id`, vals);
    }
    flash(req, 'ok', `Đã lưu ${R.singular}.`);
    res.redirect(req.body._next === 'list' ? `/quan-tri/r/${req.params.res}` : `/quan-tri/r/${req.params.res}/${saved.id}`);
  } catch (e) { next(e); }
});

router.post('/r/:res/:id/xoa', getRes, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (req.R.table === 'users') {
      if (id === req.session.user.id) { flash(req, 'err', 'Không thể tự xóa tài khoản đang đăng nhập.'); return res.redirect('/quan-tri/r/users'); }
      const others = await one("SELECT count(*)::int AS n FROM users WHERE role='admin' AND active AND id<>$1", [id]);
      if (others.n === 0) { flash(req, 'err', 'Phải giữ ít nhất một quản trị viên.'); return res.redirect('/quan-tri/r/users'); }
    }
    await q(`DELETE FROM ${req.R.table} WHERE id=$1`, [id]);
    flash(req, 'ok', `Đã xóa ${req.R.singular}.`);
    res.redirect('/quan-tri/r/' + req.params.res);
  } catch (e) { next(e); }
});

router.post('/r/:res/:id/nhan-ban', getRes, async (req, res, next) => {
  try {
    const R = req.R;
    if (R.table === 'users') return res.redirect('/quan-tri/r/users');
    const item = await one(`SELECT * FROM ${R.table} WHERE id=$1`, [req.params.id]);
    if (!item) return res.redirect('/quan-tri/r/' + req.params.res);
    delete item.id;
    if ('slug' in item) item.slug = item.slug + '-ban-sao-' + Date.now().toString(36);
    if ('active' in item) item.active = false;
    if ('status' in item) item.status = 'draft';
    const keys = Object.keys(item);
    const vals = keys.map(k => (item[k] !== null && typeof item[k] === 'object' && !(item[k] instanceof Date)) ? JSON.stringify(item[k]) : item[k]);
    const saved = await one(`INSERT INTO ${R.table}(${keys.join(',')}) VALUES (${keys.map((_, i) => '$' + (i + 1)).join(',')}) RETURNING id`, vals);
    flash(req, 'ok', `Đã tạo bản sao (đang ẩn). Chỉnh sửa rồi bật hiển thị.`);
    res.redirect(`/quan-tri/r/${req.params.res}/${saved.id}`);
  } catch (e) { next(e); }
});

// ---------- Yêu cầu tư vấn ----------
const LEAD_STATUS = { new: 'Mới', contacted: 'Đã liên hệ', done: 'Hoàn tất', spam: 'Rác' };
router.get('/yeu-cau', async (req, res, next) => {
  try {
    const st = LEAD_STATUS[req.query.trang_thai] ? req.query.trang_thai : '';
    const rows = await q(`SELECT * FROM leads ${st ? 'WHERE status=$1' : ''} ORDER BY created_at DESC LIMIT 500`, st ? [st] : []);
    res.render('admin/leads', { rows, st, LEAD_STATUS });
  } catch (e) { next(e); }
});
router.get('/yeu-cau/xuat.csv', async (req, res, next) => {
  try {
    const rows = await q('SELECT * FROM leads ORDER BY created_at DESC');
    const esc = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
    const head = ['Mã', 'Thời gian', 'Họ tên', 'Đơn vị', 'Điện thoại', 'Email', 'Lĩnh vực', 'Nội dung', 'Trạng thái', 'Ghi chú'];
    const body = rows.map(r => [r.code, new Date(r.created_at).toLocaleString('vi-VN'), r.name, r.org, r.phone, r.email, r.need, r.message, LEAD_STATUS[r.status], r.note].map(esc).join(','));
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="yeu-cau-tu-van.csv"');
    res.send('﻿' + [head.map(esc).join(','), ...body].join('\r\n'));
  } catch (e) { next(e); }
});
router.get('/yeu-cau/:id', async (req, res, next) => {
  try {
    const lead = await one('SELECT * FROM leads WHERE id=$1', [req.params.id]);
    if (!lead) return res.redirect('/quan-tri/yeu-cau');
    res.render('admin/lead', { lead, LEAD_STATUS });
  } catch (e) { next(e); }
});
router.post('/yeu-cau/:id', async (req, res, next) => {
  try {
    const st = LEAD_STATUS[req.body.status] ? req.body.status : 'new';
    await q('UPDATE leads SET status=$1, note=$2 WHERE id=$3', [st, String(req.body.note || '').slice(0, 5000), req.params.id]);
    flash(req, 'ok', 'Đã cập nhật yêu cầu.');
    res.redirect('/quan-tri/yeu-cau/' + req.params.id);
  } catch (e) { next(e); }
});
router.post('/yeu-cau/:id/xoa', adminOnly, async (req, res, next) => {
  try { await q('DELETE FROM leads WHERE id=$1', [req.params.id]); flash(req, 'ok', 'Đã xóa yêu cầu.'); res.redirect('/quan-tri/yeu-cau'); }
  catch (e) { next(e); }
});

// ---------- Thư viện tệp ----------
router.get('/thu-vien', async (req, res, next) => {
  try { res.render('admin/media', { rows: await q('SELECT * FROM media ORDER BY created_at DESC LIMIT 300') }); }
  catch (e) { next(e); }
});
router.post('/thu-vien', async (req, res, next) => {
  try {
    await recordMedia(req.files);
    const n = (req.files || []).length;
    flash(req, n ? 'ok' : 'err', n ? `Đã tải lên ${n} tệp.` : 'Không có tệp hợp lệ (PNG, JPG, WebP, GIF, SVG, ICO, PDF; tối đa 15 MB).');
    res.redirect('/quan-tri/thu-vien');
  } catch (e) { next(e); }
});
router.post('/thu-vien/:id/xoa', async (req, res, next) => {
  try {
    const m = await one('DELETE FROM media WHERE id=$1 RETURNING path', [req.params.id]);
    if (m) {
      const { UPLOAD_DIR } = require('../util');
      const p = require('path').join(UPLOAD_DIR, m.path.replace(/^\/uploads\//, ''));
      if (p.startsWith(UPLOAD_DIR)) fs.unlink(p, () => {});
    }
    flash(req, 'ok', 'Đã xóa tệp.');
    res.redirect('/quan-tri/thu-vien');
  } catch (e) { next(e); }
});
// Tải ảnh từ trình soạn thảo
router.post('/tai-anh', async (req, res, next) => {
  try {
    const f = (req.files || [])[0];
    if (!f || !f.mimetype.startsWith('image/')) return res.status(400).json({ error: 'Tệp không hợp lệ' });
    await recordMedia([f]);
    res.json({ url: publicUploadPath(f) });
  } catch (e) { next(e); }
});

// ---------- Tài khoản cá nhân ----------
router.get('/mat-khau', (req, res) => res.render('admin/password', { error: null }));
router.post('/mat-khau', async (req, res, next) => {
  try {
    const u = await one('SELECT * FROM users WHERE id=$1', [req.session.user.id]);
    const { current, next: pw, confirm } = req.body;
    let error = null;
    if (!(await bcrypt.compare(String(current || ''), u.password_hash))) error = 'Mật khẩu hiện tại không đúng.';
    else if (String(pw || '').length < 10) error = 'Mật khẩu mới cần tối thiểu 10 ký tự.';
    else if (pw !== confirm) error = 'Hai lần nhập mật khẩu mới không khớp.';
    if (error) return res.status(422).render('admin/password', { error });
    await q('UPDATE users SET password_hash=$1 WHERE id=$2', [await bcrypt.hash(pw, 12), u.id]);
    flash(req, 'ok', 'Đã đổi mật khẩu.');
    res.redirect('/quan-tri');
  } catch (e) { next(e); }
});

module.exports = router;
