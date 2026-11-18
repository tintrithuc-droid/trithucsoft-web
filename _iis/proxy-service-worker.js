// Service worker "tự hủy" thay cho service worker của website React cũ (18/11/2026).
// Trình duyệt từng vào trang cũ sẽ tải tệp này khi kiểm tra cập nhật: xóa toàn bộ cache cũ,
// gỡ đăng ký, rồi tải lại các tab đang mở để hiện website mới. Website mới không dùng service worker.
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (event) {
  event.waitUntil((async function () {
    try {
      var keys = await caches.keys();
      await Promise.all(keys.map(function (k) { return caches.delete(k); }));
    } catch (e) {}
    await self.registration.unregister();
    var clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach(function (c) { try { c.navigate(c.url); } catch (e) {} });
  })());
});
