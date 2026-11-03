(function () {
  // Trình soạn thảo nội dung (Quill, mã nguồn mở BSD)
  var editors = [];
  if (window.Quill) {
    document.querySelectorAll('[data-rte]').forEach(function (el) {
      var input = document.getElementById(el.dataset.rte);
      var q = new Quill(el, {
        theme: 'snow',
        modules: { toolbar: { container: [[{ header: [2, 3, false] }], ['bold', 'italic', 'underline', 'link'], [{ list: 'ordered' }, { list: 'bullet' }], ['blockquote', 'image', 'video'], ['clean']],
          handlers: { image: function () { pickImage(q); } } } },
      });
      editors.push({ q: q, input: input });
    });
  }
  function pickImage(q) {
    var f = document.createElement('input'); f.type = 'file'; f.accept = 'image/*';
    f.onchange = function () {
      var fd = new FormData(); fd.append('file', f.files[0]); fd.append('_csrf', window.CSRF);
      fetch('/quan-tri/tai-anh', { method: 'POST', body: fd, headers: { 'x-csrf-token': window.CSRF } })
        .then(function (r) { return r.json(); })
        .then(function (j) { if (j.url) { var r = q.getSelection(true); q.insertEmbed(r ? r.index : 0, 'image', j.url); } else alert('Không tải được ảnh'); });
    };
    f.click();
  }

  // Danh sách lặp (bài toán, phân hệ, câu hỏi thường gặp...)
  var reps = [];
  document.querySelectorAll('[data-rep]').forEach(function (box) {
    var input = document.getElementById(box.dataset.rep);
    var sub = JSON.parse(box.dataset.sub);
    var data = []; try { data = JSON.parse(input.value || '[]'); } catch (e) {}
    function render() {
      box.innerHTML = '';
      data.forEach(function (row, i) {
        var r = document.createElement('div'); r.className = 'rep-row';
        var fields = document.createElement('div'); fields.className = 'rep-fields';
        sub.forEach(function (sf) {
          var el = document.createElement(sf.type === 'textarea' ? 'textarea' : 'input');
          if (sf.type === 'textarea') el.rows = 2; else el.type = 'text';
          el.placeholder = sf.label; el.setAttribute('aria-label', sf.label); el.value = row[sf.name] || '';
          el.addEventListener('input', function () { row[sf.name] = el.value; });
          fields.appendChild(el);
        });
        var btns = document.createElement('div'); btns.className = 'rep-btns';
        [['↑', -1], ['↓', 1]].forEach(function (b) {
          var x = document.createElement('button'); x.type = 'button'; x.className = 'btn sm'; x.textContent = b[0]; x.title = b[1] < 0 ? 'Lên' : 'Xuống';
          x.onclick = function () { var j = i + b[1]; if (j < 0 || j >= data.length) return; var t = data[i]; data[i] = data[j]; data[j] = t; render(); };
          btns.appendChild(x);
        });
        var del = document.createElement('button'); del.type = 'button'; del.className = 'btn sm danger-btn'; del.textContent = '✕'; del.title = 'Xóa dòng';
        del.onclick = function () { data.splice(i, 1); render(); };
        btns.appendChild(del);
        r.appendChild(fields); r.appendChild(btns); box.appendChild(r);
      });
      var add = document.createElement('button'); add.type = 'button'; add.className = 'btn sm rep-add'; add.textContent = '+ Thêm dòng';
      add.onclick = function () { data.push({}); render(); var t = box.querySelectorAll('.rep-row'); var last = t[t.length - 1]; if (last) last.querySelector('input,textarea').focus(); };
      box.appendChild(add);
    }
    render();
    reps.push(function () { input.value = JSON.stringify(data); });
  });

  document.querySelectorAll('form').forEach(function (form) {
    form.addEventListener('submit', function () {
      editors.forEach(function (e) { var h = e.q.root.innerHTML; e.input.value = h === '<p><br></p>' ? '' : h; });
      reps.forEach(function (fn) { fn(); });
    });
  });

  // Xem trước biểu tượng
  document.querySelectorAll('[data-icon-preview]').forEach(function (p) {
    var sel = document.getElementById(p.dataset.iconPreview);
    sel.addEventListener('change', function () { p.style.opacity = .3; });
  });

  // Xem trước ảnh khi chọn tệp
  document.querySelectorAll('input[type=file][name^="__file_"]').forEach(function (f) {
    f.addEventListener('change', function () {
      var wrap = f.closest('.img-field'); if (!wrap || !f.files[0] || !f.files[0].type.startsWith('image/')) return;
      var img = wrap.querySelector('img.thumb');
      if (!img) { img = document.createElement('img'); img.className = 'thumb'; wrap.insertBefore(img, wrap.firstChild); }
      img.src = URL.createObjectURL(f.files[0]);
    });
  });

  // Chép đường dẫn trong thư viện
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      navigator.clipboard.writeText(b.dataset.copy).then(function () { b.textContent = 'Đã chép'; setTimeout(function () { b.textContent = 'Chép đường dẫn'; }, 1500); });
    });
  });
})();
