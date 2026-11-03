// Định nghĩa toàn bộ cấu hình động quản lý trong trang quản trị.
// Mỗi nhóm là một thẻ trong màn hình "Cấu hình website".
const { q } = require('./db');

const GROUPS = [
  {
    id: 'brand', label: 'Nhận diện thương hiệu', fields: [
      { key: 'site_name', label: 'Tên hiển thị trên logo', type: 'text', def: 'Tri Thức' },
      { key: 'site_tagline', label: 'Dòng mô tả dưới logo', type: 'text', def: 'Đồng hành chuyển đổi số từ 2006' },
      { key: 'logo', label: 'Logo (PNG, SVG, WebP; để trống sẽ dùng chữ viết tắt)', type: 'image', def: '' },
      { key: 'logo_dark', label: 'Logo trên nền tối (chân trang)', type: 'image', def: '' },
      { key: 'logo_initials', label: 'Chữ viết tắt khi chưa có logo', type: 'text', def: 'TT' },
      { key: 'favicon', label: 'Biểu tượng trên tab trình duyệt (favicon)', type: 'image', def: '' },
      { key: 'color_accent', label: 'Màu chủ đạo', type: 'color', def: '#1F5FBF' },
      { key: 'color_navy', label: 'Màu nền tối', type: 'color', def: '#0B1B33' },
    ],
  },
  {
    id: 'header', label: 'Đầu trang', fields: [
      { key: 'header_cta_label', label: 'Nút hành động trên đầu trang', type: 'text', def: 'Đặt lịch tư vấn' },
      { key: 'header_cta_url', label: 'Liên kết của nút', type: 'text', def: '/lien-he' },
      { key: 'header_lang_label', label: 'Nhãn chuyển ngôn ngữ (để trống để ẩn)', type: 'text', def: '' },
      { key: 'header_lang_url', label: 'Liên kết chuyển ngôn ngữ', type: 'text', def: '' },
      { key: 'announcement', label: 'Thanh thông báo trên cùng (để trống để ẩn)', type: 'text', def: '' },
      { key: 'announcement_url', label: 'Liên kết thanh thông báo', type: 'text', def: '' },
    ],
  },
  {
    id: 'home', label: 'Trang chủ', fields: [
      { key: 'home_clients_title', label: 'Tiêu đề dải logo khách hàng', type: 'text', def: 'Đồng hành cùng các cơ quan, đơn vị' },
      { key: 'home_areas_kicker', label: 'Nhãn mục Các mảng hoạt động', type: 'text', def: 'Ba mảng hoạt động' },
      { key: 'home_areas_title', label: 'Tiêu đề mục Các mảng hoạt động', type: 'text', def: 'Một đối tác cho cả chặng đường chuyển đổi số' },
      { key: 'home_solutions_kicker', label: 'Nhãn mục Giải pháp', type: 'text', def: 'Giải pháp phần mềm' },
      { key: 'home_solutions_title', label: 'Tiêu đề mục Giải pháp', type: 'text', def: 'Giải pháp phần mềm đang triển khai' },
      { key: 'home_consult_kicker', label: 'Nhãn mục Tư vấn', type: 'text', def: 'Tư vấn CNTT' },
      { key: 'home_consult_title', label: 'Tiêu đề mục Tư vấn', type: 'text', def: 'Tư vấn dự án ứng dụng CNTT từ lúc lập đến lúc nghiệm thu' },
      { key: 'home_consult_text', label: 'Mô tả mục Tư vấn', type: 'textarea', def: 'Đội ngũ tư vấn của Tri Thức hiểu quy trình đầu tư công và đấu thầu, giúp chủ đầu tư triển khai dự án đúng quy định, đúng tiến độ.' },
      { key: 'home_consult_cta', label: 'Nút mục Tư vấn', type: 'text', def: 'Trao đổi với chuyên gia tư vấn' },
      { key: 'home_license_kicker', label: 'Nhãn mục Bản quyền', type: 'text', def: 'Phần mềm bản quyền' },
      { key: 'home_license_title', label: 'Tiêu đề mục Bản quyền', type: 'text', def: 'Phần mềm chính hãng, xuất hóa đơn đầy đủ cho đơn vị' },
      { key: 'home_license_link_label', label: 'Nhãn liên kết mục Bản quyền', type: 'text', def: 'Xem bảng giá và đặt mua' },
      { key: 'home_license_link_url', label: 'Liên kết mục Bản quyền', type: 'text', def: '/phan-mem-ban-quyen' },
      { key: 'home_process_kicker', label: 'Nhãn mục Cách làm việc', type: 'text', def: 'Cách chúng tôi làm' },
      { key: 'home_process_title', label: 'Tiêu đề mục Cách làm việc', type: 'text', def: 'Đồng hành từ tư vấn đến vận hành' },
      { key: 'home_projects_kicker', label: 'Nhãn mục Dự án', type: 'text', def: 'Dự án tiêu biểu' },
      { key: 'home_projects_title', label: 'Tiêu đề mục Dự án', type: 'text', def: 'Những hệ thống đang phục vụ cơ quan nhà nước' },
      { key: 'home_innov_kicker', label: 'Nhãn mục Đổi mới', type: 'text', def: 'Đổi mới sáng tạo' },
      { key: 'home_innov_title', label: 'Tiêu đề mục Đổi mới', type: 'text', def: 'Công nghệ mới, dùng đúng chỗ' },
      { key: 'home_innov_text', label: 'Đoạn mô tả mục Đổi mới', type: 'textarea', def: 'Tri Thức ứng dụng công nghệ và tư duy đổi mới để giúp tổ chức vận hành hiệu quả, minh bạch và bền vững. Mỗi công nghệ được chọn vì nó giải quyết một bài toán cụ thể của khách hàng.' },
      { key: 'home_about_kicker', label: 'Nhãn mục Về chúng tôi', type: 'text', def: 'Về Tri Thức' },
      { key: 'home_about_title', label: 'Tiêu đề mục Về chúng tôi', type: 'text', def: '20 năm, một hành trình, vạn lời tri ân' },
      { key: 'home_about_text', label: 'Đoạn giới thiệu ngắn', type: 'textarea', def: 'Thành lập năm 2006, Tri Thức hướng tới trở thành đơn vị công nghệ đồng hành hiệu quả trong hiện đại hóa quản lý, điều hành và khai thác dữ liệu. Chúng tôi làm việc theo phương châm Uy tín, Chuyên nghiệp, Đồng hành phát triển.' },
      { key: 'home_about_link_label', label: 'Nhãn liên kết Về chúng tôi', type: 'text', def: 'Tìm hiểu hành trình 20 năm' },
      { key: 'home_about_link_url', label: 'Liên kết Về chúng tôi', type: 'text', def: '/gioi-thieu' },
      { key: 'home_news_kicker', label: 'Nhãn mục Tin tức', type: 'text', def: 'Kiến thức chuyển đổi số' },
      { key: 'home_news_title', label: 'Tiêu đề mục Tin tức', type: 'text', def: 'Chia sẻ từ đội ngũ Tri Thức' },
      { key: 'cta_title', label: 'Tiêu đề khối kêu gọi cuối trang', type: 'text', def: 'Bắt đầu từ một buổi trao đổi 30 phút' },
      { key: 'cta_text', label: 'Mô tả khối kêu gọi', type: 'textarea', def: 'Kể cho chúng tôi về công việc của đơn vị. Chuyên gia Tri Thức sẽ gợi ý hướng đi phù hợp, hoàn toàn miễn phí.' },
      { key: 'cta_button_label', label: 'Nút khối kêu gọi', type: 'text', def: 'Đặt lịch tư vấn' },
      { key: 'cta_button_url', label: 'Liên kết nút khối kêu gọi', type: 'text', def: '/lien-he' },
    ],
  },
  {
    id: 'contact', label: 'Thông tin liên hệ', fields: [
      { key: 'company_name', label: 'Tên công ty đầy đủ', type: 'text', def: 'Công ty Cổ phần Tin học Tri Thức' },
      { key: 'company_name_upper', label: 'Tên công ty ở chân trang', type: 'text', def: 'CÔNG TY CỔ PHẦN TIN HỌC TRI THỨC' },
      { key: 'address', label: 'Địa chỉ trụ sở', type: 'textarea', def: '' },
      { key: 'tax_code', label: 'Mã số thuế', type: 'text', def: '' },
      { key: 'legal_rep', label: 'Người đại diện theo pháp luật', type: 'text', def: '' },
      { key: 'hotline', label: 'Hotline', type: 'text', def: '' },
      { key: 'email', label: 'Email', type: 'text', def: '' },
      { key: 'working_hours', label: 'Giờ làm việc', type: 'text', def: '' },
      { key: 'map_embed', label: 'Đường dẫn nhúng Google Maps (src của iframe)', type: 'text', def: '' },
      { key: 'contact_title', label: 'Tiêu đề trang liên hệ', type: 'text', def: 'Đặt lịch tư vấn miễn phí' },
      { key: 'contact_intro', label: 'Mô tả trang liên hệ', type: 'textarea', def: 'Để lại thông tin, chuyên gia Tri Thức sẽ gọi lại trong giờ làm việc để hẹn buổi trao đổi 30 phút.' },
      { key: 'contact_needs', label: 'Danh sách lĩnh vực trong form (mỗi dòng một mục)', type: 'textarea', def: 'Giải pháp phần mềm\nTư vấn dự án CNTT\nPhần mềm bản quyền\nKhác' },
      { key: 'lead_notify_email', label: 'Email nhận thông báo khi có yêu cầu mới (cần cấu hình SMTP)', type: 'text', def: '' },
    ],
  },
  {
    id: 'social', label: 'Mạng xã hội', fields: [
      { key: 'social_zalo', label: 'Zalo OA', type: 'text', def: '' },
      { key: 'social_facebook', label: 'Facebook', type: 'text', def: '' },
      { key: 'social_linkedin', label: 'LinkedIn', type: 'text', def: '' },
      { key: 'social_youtube', label: 'YouTube', type: 'text', def: '' },
      { key: 'float_contact', label: 'Hiện nút gọi và Zalo nổi trên điện thoại', type: 'checkbox', def: '1' },
    ],
  },
  {
    id: 'footer', label: 'Chân trang', fields: [
      { key: 'footer_about', label: 'Đoạn giới thiệu ngắn ở chân trang', type: 'textarea', def: '' },
      { key: 'footer_offices_title', label: 'Tiêu đề cột Văn phòng (danh sách văn phòng quản lý ở Khối trang chủ, nhóm Văn phòng)', type: 'text', def: 'Văn phòng' },
      { key: 'footer_col1_title', label: 'Tiêu đề cột 1', type: 'text', def: 'Dịch vụ' },
      { key: 'footer_col2_title', label: 'Tiêu đề cột 2', type: 'text', def: 'Công ty' },
      { key: 'footer_col3_title', label: 'Tiêu đề cột 3 (mạng xã hội)', type: 'text', def: 'Kết nối' },
      { key: 'footer_copyright', label: 'Dòng bản quyền ({year} sẽ tự thay bằng năm hiện tại)', type: 'text', def: '© {year} Công ty Cổ phần Tin học Tri Thức. Số ĐKKD 0304363608 do Phòng Đăng ký kinh doanh, Sở Kế hoạch và Đầu tư TP. HCM cấp ngày 23/06/2008.' },
    ],
  },
  {
    id: 'seo', label: 'SEO và đo lường', fields: [
      { key: 'seo_title', label: 'Tiêu đề trang chủ trên Google', type: 'text', def: 'Tri Thức | Đối tác chuyển đổi số cho cơ quan và doanh nghiệp' },
      { key: 'seo_desc', label: 'Mô tả mặc định', type: 'textarea', def: 'Công ty Cổ phần Tin học Tri Thức: giải pháp phần mềm chính quyền số, GIS, kho dữ liệu; tư vấn dự án CNTT; phần mềm bản quyền. 20 năm đồng hành cùng cơ quan nhà nước và doanh nghiệp.' },
      { key: 'og_image', label: 'Ảnh chia sẻ mạng xã hội mặc định (1200x630)', type: 'image', def: '' },
      { key: 'google_verify', label: 'Mã xác minh Google Search Console', type: 'text', def: '' },
      { key: 'analytics_code', label: 'Mã đo lường (Plausible, Matomo, GA4) chèn vào <head>', type: 'code', def: '' },
      { key: 'llms_txt', label: 'Nội dung tệp llms.txt cho công cụ tìm kiếm AI', type: 'textarea', def: '' },
    ],
  },
];

const DEFAULTS = {};
GROUPS.forEach(g => g.fields.forEach(f => { DEFAULTS[f.key] = f.def; }));

let cache = null;
async function getSettings() {
  if (cache) return cache;
  const rows = await q('SELECT key, value FROM settings');
  const s = { ...DEFAULTS };
  rows.forEach(r => { s[r.key] = r.value; });
  cache = s;
  return s;
}
function clearSettingsCache() { cache = null; }

async function saveSettings(obj) {
  for (const [k, v] of Object.entries(obj)) {
    if (!(k in DEFAULTS)) continue;
    await q(`INSERT INTO settings(key, value, updated_at) VALUES ($1,$2,now())
             ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`, [k, v ?? '']);
  }
  clearSettingsCache();
}

module.exports = { GROUPS, DEFAULTS, getSettings, saveSettings, clearSettingsCache };
