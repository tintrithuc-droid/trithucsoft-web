// Bộ biểu tượng nét mảnh thống nhất (viewBox 24x24), chọn theo tên trong trang quản trị.
const ICONS = {
  gov: { label: 'Cơ quan nhà nước', d: '<path d="M3 21h18M5 21V10M19 21V10M9 21v-7M15 21v-7M2 10l10-6 10 6"/>' },
  chart: { label: 'Biểu đồ, báo cáo', d: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>' },
  broadcast: { label: 'Truyền thông, phát thanh', d: '<path d="M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4"/>' },
  briefcase: { label: 'Doanh nghiệp', d: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>' },
  shield: { label: 'An toàn thông tin', d: '<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>' },
  code: { label: 'Phần mềm', d: '<path d="M8 6l-6 6 6 6M16 6l6 6-6 6M14 4l-4 16"/>' },
  ai: { label: 'Trí tuệ nhân tạo', d: '<rect x="5" y="5" width="14" height="14" rx="3"/><path d="M9 1v4M15 1v4M9 19v4M15 19v4M1 9h4M1 15h4M19 9h4M19 15h4"/>' },
  database: { label: 'Dữ liệu', d: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>' },
  cloud: { label: 'Đám mây', d: '<path d="M18 10h-1.3A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>' },
  mobile: { label: 'Di động', d: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>' },
  doc: { label: 'Hồ sơ, văn bản', d: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h4"/>' },
  clock: { label: 'Thời gian', d: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>' },
  report: { label: 'Thống kê', d: '<path d="M3 3v18h18"/><path d="M8 17V11M13 17V7M18 17v-4"/>' },
  users: { label: 'Con người', d: '<circle cx="9" cy="8" r="4"/><path d="M2 21c0-3.9 3.1-7 7-7s7 3.1 7 7M16 4a4 4 0 0 1 0 8M22 21c0-3-1.8-5.6-4.5-6.6"/>' },
  edu: { label: 'Giáo dục', d: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5M22 9v6"/>' },
  health: { label: 'Y tế', d: '<path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"/>' },
  map: { label: 'Bản đồ, GIS', d: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>' },
  spark: { label: 'Đổi mới', d: '<path d="M12 2l2.4 5.6L20 10l-5.6 2.4L12 18l-2.4-5.6L4 10l5.6-2.4z"/>' },
  check: { label: 'Dấu kiểm', d: '<path d="M20 6L9 17l-5-5"/>' },
  award: { label: 'Giải thưởng', d: '<circle cx="12" cy="9" r="6"/><path d="M8.5 14L7 22l5-3 5 3-1.5-8"/>' },
  consult: { label: 'Tư vấn', d: '<path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/>' },
  rfid: { label: 'RFID, lưu trữ', d: '<path d="M5 12a7 7 0 0 1 14 0M8 12a4 4 0 0 1 8 0"/><circle cx="12" cy="12" r="1.5"/><path d="M12 14v7"/>' },
  ship: { label: 'Giao thông thủy', d: '<path d="M3 17l2 4h14l2-4-9-3z"/><path d="M12 14V4M8 8h8"/>' },
  globe: { label: 'Cổng thông tin', d: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>' },
  gavel: { label: 'Pháp lý, xử phạt', d: '<path d="M14 4l6 6M11 7l6 6M4 20l7-7M13 3l8 8-3 3-8-8z"/>' },
  handshake: { label: 'Đồng hành', d: '<path d="M11 17l2 2a1.4 1.4 0 0 0 2-2M14 14l2.5 2.5a1.4 1.4 0 0 0 2-2L15 11M3 7l4-4 5 5-3 3 3 3M21 7l-4-4-4 4"/>' },
};

function icon(name, size = 24, stroke = 'currentColor', sw = 1.8) {
  const i = ICONS[name] || ICONS.code;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${i.d}</svg>`;
}

const ICON_OPTIONS = Object.entries(ICONS).map(([v, i]) => ({ value: v, label: i.label }));

module.exports = { ICONS, icon, ICON_OPTIONS };
