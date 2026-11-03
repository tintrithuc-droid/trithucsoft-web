// Xuất bản xem thử tĩnh của website đang chạy (mặc định http://localhost:3000) vào thư mục export/.
// Cách dùng: npm start (cửa sổ khác), rồi: node tools/xuat-ban-xem-thu.js
const fs = require('fs'), path = require('path');
const OUT = 'export', H = 'http://localhost:3000';
const name = p => p === '/' ? 'index.html' : p.replace(/^\/|\/$/g, '').replace(/\//g, '--') + '.html';
const bar = `<div class="pv-bar" role="note"><div class="wrap"><span><b>Bản xem thử</b> website mới Tri Thức. Biểu mẫu chưa gửi đi thật.</span><a href="quan-tri.html">Xem trang quản trị →</a></div></div>`;
function rewrite(html) {
  html = html.replace(/(href|src|action)="(\/[^"]*)"/g, (m, attr, url) => {
    if (url.startsWith('/static/')) return `${attr}="${url.slice(1)}"`;
    if (url.startsWith('/uploads/')) return `${attr}="${url.slice(1)}"`;
    const [pathq, hash] = url.split('#'); const p = pathq.split('?')[0] || '/';
    if (p.startsWith('/quan-tri')) return `${attr}="quan-tri.html"`;
    return `${attr}="${name(p)}${hash ? '#' + hash : ''}"`;
  });
  html = html.split(H).join('https://trithucsoft.vn');
  html = html.replace(/<body([^>]*)>/, `<body$1>\n${bar}`);
  html = html.replace('</head>', '<link rel="stylesheet" href="static/css/preview.css">\n</head>');
  html = html.replace('</body>', '<script src="static/js/preview.js" defer></script>\n</body>');
  return html;
}
(async () => {
  const sm = await (await fetch(H + '/sitemap.xml')).text();
  const paths = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replace(H, '') || '/');
  if (!paths.includes('/lien-he')) paths.push('/lien-he');
  const files = [];
  for (const p of paths) {
    const r = await fetch(H + p); if (r.status !== 200) { console.log('SKIP', p, r.status); continue; }
    let html = rewrite(await r.text());
    const f = name(p);
    if (f === 'index.html') { // trang chính: bỏ khung doctype/html/head/body vì nơi xuất bản tự bọc
      html = html.replace(/<!doctype html>\s*<html[^>]*>\s*<head>/i, '').replace(/<\/head>\s*<body[^>]*>/i, '').replace(/<\/body>\s*<\/html>\s*$/i, '');
    }
    fs.writeFileSync(path.join(OUT, f), html); files.push(f);
  }
  console.log(files.length, 'pages'); fs.writeFileSync('pages.json', JSON.stringify(files));
})();
