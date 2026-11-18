// Kiểm thử tự động: npm test (cần PostgreSQL; dùng TEST_DATABASE_URL nếu có)
process.env.NODE_ENV = 'test';
if (process.env.TEST_DATABASE_URL) process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
process.env.ADMIN_EMAIL = 'test-admin@example.com';
process.env.ADMIN_PASSWORD = 'mat-khau-kiem-thu-123';
const test = require('node:test');
const assert = require('node:assert');
const { slugify, cleanHtml } = require('../src/util');

test('slugify chuyển tiếng Việt có dấu thành đường dẫn', () => {
  assert.equal(slugify('Quản lý điều hành cấp xã, phường'), 'quan-ly-dieu-hanh-cap-xa-phuong');
  assert.equal(slugify('Đổi mới & Sáng tạo 2026'), 'doi-moi-sang-tao-2026');
});

test('cleanHtml loại bỏ mã độc', () => {
  const out = cleanHtml('<p onclick="x()">Chào</p><script>alert(1)</script><a href="javascript:alert(1)">x</a><img src="/a.png" onerror="y">');
  assert.ok(!/script|onclick|onerror|javascript:/.test(out), out);
  assert.ok(out.includes('<p>Chào</p>'));
});

test('website và trang quản trị', async t => {
  const { pool } = require('../src/db');
  await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  await require('../src/migrate')();
  const app = require('../server');
  const srv = app.listen(0); const base = `http://localhost:${srv.address().port}`;
  t.after(() => { srv.close(); pool.end(); });

  for (const u of ['/', '/giai-phap', '/giai-phap/quan-ly-dieu-hanh-cap-xa-phuong', '/du-an', '/tin-tuc', '/lien-he', '/gioi-thieu', '/sitemap.xml', '/robots.txt', '/llms.txt']) {
    const r = await fetch(base + u); assert.equal(r.status, 200, u);
  }
  assert.equal((await fetch(base + '/khong-ton-tai')).status, 404);
  const home = await (await fetch(base + '/')).text();
  assert.ok(home.includes('Nền tảng vững chắc'));
  assert.ok(home.includes('088 679 2809'));

  // Đăng nhập và đổi khẩu hiệu dưới logo
  let cookie = '';
  const keep = r => { const c = r.headers.getSetCookie(); if (c.length) cookie = c.map(x => x.split(';')[0]).join('; '); return r; };
  const csrfOf = html => html.match(/name="_csrf" value="([^"]+)"/)[1];
  let r = keep(await fetch(base + '/quan-tri/dang-nhap'));
  let token = csrfOf(await r.text());
  r = keep(await fetch(base + '/quan-tri/dang-nhap', { method: 'POST', redirect: 'manual', headers: { cookie, 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ _csrf: token, email: 'test-admin@example.com', password: 'mat-khau-kiem-thu-123' }) }));
  assert.equal(r.status, 302);
  r = keep(await fetch(base + '/quan-tri/cau-hinh?tab=brand', { headers: { cookie } }));
  const html = await r.text(); token = csrfOf(html);
  const fd = new FormData();
  fd.append('_csrf', token); fd.append('_tab', 'brand'); fd.append('site_name', 'Tri Thức'); fd.append('site_tagline', 'Khẩu hiệu kiểm thử');
  fd.append('logo_initials', 'TT'); fd.append('color_accent', '#0F766E'); fd.append('color_navy', '#0B1B33');
  r = await fetch(base + '/quan-tri/cau-hinh', { method: 'POST', redirect: 'manual', headers: { cookie }, body: fd });
  assert.equal(r.status, 302);
  const home2 = await (await fetch(base + '/')).text();
  assert.ok(home2.includes('Khẩu hiệu kiểm thử'));
  assert.ok(home2.includes('--accent:#0F766E'));

  // Phân luồng theo đối tượng khách hàng
  const { q } = require('../src/db');
  await q("UPDATE solutions SET audience='nha-nuoc' WHERE slug='quan-ly-dieu-hanh-cap-xa-phuong'");
  const sol = await q('SELECT title FROM solutions WHERE slug=$1', ['quan-ly-dieu-hanh-cap-xa-phuong']);
  const gov = await (await fetch(base + '/danh-cho/co-quan-nha-nuoc')).text();
  const biz = await (await fetch(base + '/danh-cho/doanh-nghiep')).text();
  assert.ok(gov.includes(sol[0].title), 'giải pháp nhà nước hiện ở trang cơ quan nhà nước');
  assert.ok(!biz.includes(sol[0].title), 'giải pháp nhà nước không hiện ở trang doanh nghiệp');
  assert.equal((await fetch(base + '/danh-cho/khong-co')).status, 404);
  assert.ok(home2.includes('/danh-cho/doanh-nghiep'), 'trang chủ có khối theo đối tượng');
  assert.ok((await (await fetch(base + '/sitemap.xml')).text()).includes('/danh-cho/co-quan-nha-nuoc'));
  // Nút Đăng ký demo điền sẵn tên giải pháp vào form
  const lh = await (await fetch(base + '/lien-he?giai-phap=' + encodeURIComponent('GIS & bản đồ'))).text();
  assert.ok(lh.includes('Đăng ký demo giải pháp: GIS &amp; bản đồ'));
  // Menu thả xuống
  await q("INSERT INTO menu_items(location, label, url, parent_url, sort, active) VALUES ('header','Cho doanh nghiệp','/danh-cho/doanh-nghiep','/giai-phap',1,true)");
  const home3 = await (await fetch(base + '/')).text();
  assert.ok(/class="sub"[^>]*>.*Cho doanh nghiệp/s.test(home3), 'mục con nằm trong danh sách thả xuống');
  const r2 = await fetch(base + '/');
  assert.ok((r2.headers.get('permissions-policy') || '').includes('camera=()'));
  assert.ok(!(r2.headers.get('content-security-policy') || '').includes('fonts.googleapis'));

  // Không có mã CSRF thì bị chặn
  r = await fetch(base + '/quan-tri/cau-hinh', { method: 'POST', redirect: 'manual', headers: { cookie, 'content-type': 'application/x-www-form-urlencoded' }, body: '_tab=brand&site_tagline=hack' });
  assert.equal(r.status, 403);
  // Chưa đăng nhập thì không vào được quản trị
  r = await fetch(base + '/quan-tri/r/posts', { redirect: 'manual' });
  assert.equal(r.status, 302);
});
