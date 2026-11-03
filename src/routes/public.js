const express = require('express');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const { q, one } = require('../db');
const { getSettings } = require('../settings');
const { icon } = require('../icons');
const { csrf, fmtDate } = require('../util');

const router = express.Router();
const BASE = () => (process.env.BASE_URL || '').replace(/\/$/, '');

// Nạp cấu hình, menu cho mọi trang
router.use(async (req, res, next) => {
  try {
    const s = await getSettings();
    const menus = await q('SELECT location, label, url, new_tab FROM menu_items WHERE active ORDER BY sort, id');
    const offices = await q("SELECT title, body FROM blocks WHERE grp='offices' AND active ORDER BY sort, id");
    const by = loc => menus.filter(m => m.location === loc);
    const base = BASE() || `${req.protocol}://${req.get('host')}`;
    Object.assign(res.locals, {
      s, icon, fmtDate, base, offices,
      menu: { header: by('header'), footer1: by('footer_1'), footer2: by('footer_2'), legal: by('footer_legal') },
      path: req.path,
      canonical: base + (req.path === '/' ? '/' : req.path.replace(/\/$/, '')),
      seo: { title: s.seo_title, desc: s.seo_desc, image: s.og_image, type: 'website' },
      year: new Date().getFullYear(),
      isActive: url => url !== '/' && (req.path === url || req.path.startsWith(url.replace(/#.*$/, '') + '/')),
      tel: v => String(v || '').replace(/[^0-9+]/g, ''),
      lines: v => String(v || '').split(/\r?\n/),
    });
    next();
  } catch (e) { next(e); }
});

function seo(res, { title, desc, image, type }) {
  const s = res.locals.s;
  res.locals.seo = {
    title: title ? `${title} | ${s.site_name}` : s.seo_title,
    desc: desc || s.seo_desc,
    image: image || s.og_image,
    type: type || 'website',
  };
}

router.get('/', async (req, res, next) => {
  try {
    const [banners, blocks, solutions, projects, clients, testimonials, posts] = await Promise.all([
      q('SELECT * FROM banners WHERE active ORDER BY sort, id'),
      q('SELECT * FROM blocks WHERE active ORDER BY sort, id'),
      q('SELECT * FROM solutions WHERE active ORDER BY sort, id'),
      q('SELECT * FROM projects WHERE active AND featured ORDER BY sort, id LIMIT 6'),
      q('SELECT * FROM clients WHERE active ORDER BY sort, id'),
      q('SELECT * FROM testimonials WHERE active ORDER BY sort, id'),
      q("SELECT * FROM posts WHERE status='published' AND published_at <= now() ORDER BY published_at DESC LIMIT 3"),
    ]);
    const g = k => blocks.filter(b => b.grp === k);
    res.render('home', {
      banners, solutions, projects, clients, testimonials, posts,
      stats: g('stats'), process: g('process'), innovation: g('innovation'), badges: g('badges'),
      areas: g('areas'), consulting: g('consulting'), licenses: g('licenses'), aboutPoints: g('about_points'),
      categories: [...new Set(projects.map(p => p.category).filter(Boolean))],
    });
  } catch (e) { next(e); }
});

router.get('/giai-phap', async (req, res, next) => {
  try {
    seo(res, { title: 'Giải pháp', desc: 'Các giải pháp chuyển đổi số của Tri Thức cho cơ quan nhà nước và doanh nghiệp.' });
    res.render('solutions', { solutions: await q('SELECT * FROM solutions WHERE active ORDER BY sort, id') });
  } catch (e) { next(e); }
});

router.get('/giai-phap/:slug', async (req, res, next) => {
  try {
    const item = await one('SELECT * FROM solutions WHERE slug=$1 AND active', [req.params.slug]);
    if (!item) return next();
    seo(res, { title: item.seo_title || item.title, desc: item.seo_desc || item.summary, image: item.image });
    const others = await q('SELECT slug, title, icon, summary FROM solutions WHERE active AND id<>$1 ORDER BY sort, id LIMIT 3', [item.id]);
    res.render('solution', { item, others });
  } catch (e) { next(e); }
});

router.get('/du-an', async (req, res, next) => {
  try {
    const all = await q('SELECT * FROM projects WHERE active ORDER BY sort, id');
    const categories = [...new Set(all.map(p => p.category).filter(Boolean))];
    const cat = req.query['linh-vuc'] || '';
    seo(res, { title: 'Dự án tiêu biểu', desc: 'Những dự án Tri Thức đã triển khai, với kết quả đo được tại đơn vị khách hàng.' });
    res.render('projects', { projects: cat ? all.filter(p => p.category === cat) : all, categories, cat });
  } catch (e) { next(e); }
});

router.get('/du-an/:slug', async (req, res, next) => {
  try {
    const item = await one('SELECT * FROM projects WHERE slug=$1 AND active', [req.params.slug]);
    if (!item) return next();
    seo(res, { title: item.seo_title || item.title, desc: item.seo_desc || item.result, image: item.image, type: 'article' });
    res.render('project', { item });
  } catch (e) { next(e); }
});

router.get('/tin-tuc', async (req, res, next) => {
  try {
    const per = 9;
    const page = Math.max(1, parseInt(req.query.trang, 10) || 1);
    const cat = req.query['chuyen-muc'] || '';
    const where = "status='published' AND published_at <= now()" + (cat ? ' AND category=$1' : '');
    const params = cat ? [cat] : [];
    const total = (await one(`SELECT count(*)::int AS n FROM posts WHERE ${where}`, params)).n;
    const posts = await q(`SELECT * FROM posts WHERE ${where} ORDER BY published_at DESC LIMIT ${per} OFFSET ${(page - 1) * per}`, params);
    const categories = (await q("SELECT DISTINCT category FROM posts WHERE status='published' AND category<>'' ORDER BY category")).map(r => r.category);
    seo(res, { title: 'Tin tức và kiến thức', desc: 'Kiến thức chuyển đổi số, chính sách mới và tin hoạt động của Tri Thức.' });
    res.render('posts', { posts, categories, cat, page, pages: Math.max(1, Math.ceil(total / per)) });
  } catch (e) { next(e); }
});

router.get('/tin-tuc/:slug', async (req, res, next) => {
  try {
    const item = await one("SELECT * FROM posts WHERE slug=$1 AND status='published' AND published_at <= now()", [req.params.slug]);
    if (!item) return next();
    seo(res, { title: item.seo_title || item.title, desc: item.seo_desc || item.excerpt, image: item.cover, type: 'article' });
    const related = await q("SELECT * FROM posts WHERE status='published' AND published_at <= now() AND id<>$1 ORDER BY (category=$2) DESC, published_at DESC LIMIT 3", [item.id, item.category]);
    res.render('post', { item, related });
  } catch (e) { next(e); }
});

// Liên hệ và đặt lịch tư vấn
const contactLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false,
  handler: (req, res) => res.status(429).send('Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ít phút hoặc gọi hotline.') });

function validate(f) {
  const e = {};
  if (!f.name) e.name = 'Vui lòng nhập họ và tên.';
  if (!f.org) e.org = 'Vui lòng nhập tên cơ quan, đơn vị.';
  const digits = f.phone.replace(/[^0-9]/g, '');
  if (!digits) e.phone = 'Vui lòng nhập số điện thoại.';
  else if (digits.length < 10 || digits.length > 11) e.phone = 'Số điện thoại cần có 10 hoặc 11 chữ số.';
  if (f.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) e.email = 'Email chưa đúng định dạng, ví dụ ten@coquan.gov.vn.';
  if (!f.agree) e.agree = 'Bạn cần đồng ý để chúng tôi liên hệ lại.';
  return e;
}

router.get('/lien-he', csrf, (req, res) => {
  const s = res.locals.s;
  seo(res, { title: s.contact_title || 'Liên hệ', desc: s.contact_intro });
  res.render('contact', { form: { need: req.query['linh-vuc'] || '' }, err: {}, sent: null });
});

router.post('/lien-he', contactLimiter, csrf, async (req, res, next) => {
  try {
    const s = res.locals.s;
    seo(res, { title: s.contact_title || 'Liên hệ', desc: s.contact_intro });
    const b = req.body;
    const t = v => String(v || '').trim().slice(0, 2000);
    const form = { name: t(b.name), org: t(b.org), phone: t(b.phone), email: t(b.email), need: t(b.need), msg: t(b.msg), agree: !!b.agree };
    if (b.website) return res.render('contact', { form: {}, err: {}, sent: { name: form.name, phone: form.phone, code: 'TT-000000' } }); // bẫy robot
    const err = validate(form);
    if (Object.keys(err).length) return res.status(422).render('contact', { form, err, sent: null });
    const code = 'TT-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + crypto.randomBytes(2).toString('hex').toUpperCase();
    await q('INSERT INTO leads(code, name, org, phone, email, need, message, ip) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [code, form.name, form.org, form.phone, form.email, form.need, form.msg, req.ip]);
    require('../mailer').notifyLead(s.lead_notify_email, { ...form, code }, res.locals.base).catch(e => console.error('Gửi email thất bại:', e.message));
    res.render('contact', { form: {}, err: {}, sent: { name: form.name, phone: form.phone, code } });
  } catch (e) { next(e); }
});

router.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /quan-tri\n\nSitemap: ${res.locals.base}/sitemap.xml\n`);
});

router.get('/llms.txt', async (req, res, next) => {
  try {
    const s = res.locals.s;
    if (s.llms_txt) return res.type('text/plain').send(s.llms_txt);
    const sol = await q('SELECT slug, title, summary FROM solutions WHERE active ORDER BY sort');
    const lines = [`# ${s.company_name}`, '', `> ${s.seo_desc}`, '', '## Giải pháp',
      ...sol.map(x => `- [${x.title}](${res.locals.base}/giai-phap/${x.slug}): ${x.summary}`), '',
      '## Liên hệ', `- Hotline: ${s.hotline}`, `- Email: ${s.email}`, `- Đặt lịch tư vấn: ${res.locals.base}/lien-he`];
    res.type('text/plain').send(lines.join('\n'));
  } catch (e) { next(e); }
});

router.get('/sitemap.xml', async (req, res, next) => {
  try {
    const b = res.locals.base;
    const urls = [{ loc: '/' }, { loc: '/giai-phap' }, { loc: '/du-an' }, { loc: '/tin-tuc' }, { loc: '/lien-he' }];
    (await q('SELECT slug, updated_at FROM solutions WHERE active')).forEach(r => urls.push({ loc: '/giai-phap/' + r.slug, mod: r.updated_at }));
    (await q('SELECT slug, updated_at FROM projects WHERE active')).forEach(r => urls.push({ loc: '/du-an/' + r.slug, mod: r.updated_at }));
    (await q("SELECT slug, updated_at FROM posts WHERE status='published' AND published_at<=now()")).forEach(r => urls.push({ loc: '/tin-tuc/' + r.slug, mod: r.updated_at }));
    (await q('SELECT slug, updated_at FROM pages WHERE active')).forEach(r => urls.push({ loc: '/' + r.slug, mod: r.updated_at }));
    const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      urls.map(u => `  <url><loc>${b}${u.loc}</loc>${u.mod ? `<lastmod>${new Date(u.mod).toISOString().slice(0, 10)}</lastmod>` : ''}</url>`).join('\n') +
      '\n</urlset>';
    res.type('application/xml').send(xml);
  } catch (e) { next(e); }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const item = await one('SELECT * FROM pages WHERE slug=$1 AND active', [req.params.slug]);
    if (!item) return next();
    seo(res, { title: item.seo_title || item.title, desc: item.seo_desc || item.lead });
    res.render('page', { item });
  } catch (e) { next(e); }
});

router.use((req, res) => {
  seo(res, { title: 'Không tìm thấy trang' });
  res.status(404).render('404');
});

module.exports = router;
