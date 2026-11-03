(function () {
  document.documentElement.classList.add('js');
  // Menu di động
  var t = document.querySelector('.nav-toggle'), w = document.getElementById('main-nav');
  if (t && w) t.addEventListener('click', function () {
    var o = w.classList.toggle('open'); t.setAttribute('aria-expanded', o ? 'true' : 'false');
  });

  // Banner trang chủ tự chuyển
  var slides = [].slice.call(document.querySelectorAll('.hero-slide')), dots = [].slice.call(document.querySelectorAll('.hero-dots button'));
  if (slides.length > 1) {
    var cur = 0, timer;
    var show = function (i) {
      cur = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle('on', k === cur); s.setAttribute('aria-hidden', k === cur ? 'false' : 'true'); });
      dots.forEach(function (d, k) { d.setAttribute('aria-current', k === cur ? 'true' : 'false'); });
    };
    var play = function () { if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; clearInterval(timer); timer = setInterval(function () { show(cur + 1); }, 7000); };
    dots.forEach(function (d) { d.addEventListener('click', function () { show(+d.dataset.go); play(); }); });
    var hero = document.querySelector('.hero');
    hero.addEventListener('mouseenter', function () { clearInterval(timer); });
    hero.addEventListener('mouseleave', play);
    play();
  }

  // Lọc dự án trên trang chủ
  var f = document.querySelector('[data-filter]'), target = document.querySelector('[data-filter-target]');
  if (f && target) f.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    [].forEach.call(f.querySelectorAll('button'), function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    [].forEach.call(target.children, function (c) { c.hidden = !!b.dataset.cat && c.dataset.cat !== b.dataset.cat; });
  });

  // Cảm nhận khách hàng
  var qs = document.querySelector('[data-quotes]');
  if (qs) {
    var items = [].slice.call(qs.querySelectorAll('[data-quote]')), qi = 0;
    [].forEach.call(qs.querySelectorAll('[data-q]'), function (b) {
      b.addEventListener('click', function () {
        items[qi].hidden = true; qi = (qi + +b.dataset.q + items.length) % items.length; items[qi].hidden = false;
      });
    });
  }

  // Hiệu ứng nhẹ khi cuộn
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  } else { els.forEach(function (el) { el.classList.add('in'); }); }
})();
