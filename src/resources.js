// Cấu hình các loại nội dung quản lý trong trang quản trị.
// Trang quản trị tự sinh danh sách và form từ cấu hình này.
const { ICON_OPTIONS } = require('./icons');

const MENU_LOCATIONS = [
  { value: 'header', label: 'Menu đầu trang' },
  { value: 'footer_1', label: 'Chân trang, cột 1' },
  { value: 'footer_2', label: 'Chân trang, cột 2' },
  { value: 'footer_legal', label: 'Chân trang, dòng pháp lý' },
];
const BLOCK_GROUPS = [
  { value: 'stats', label: 'Dải số liệu (trang chủ)' },
  { value: 'process', label: 'Các bước làm việc (trang chủ)' },
  { value: 'innovation', label: 'Thẻ đổi mới sáng tạo (trang chủ)' },
  { value: 'areas', label: 'Các mảng hoạt động (trang chủ)' },
  { value: 'consulting', label: 'Dịch vụ tư vấn CNTT (trang chủ)' },
  { value: 'licenses', label: 'Nhóm phần mềm bản quyền (trang chủ)' },
  { value: 'about_points', label: 'Điểm mạnh (mục Về chúng tôi)' },
  { value: 'badges', label: 'Chứng nhận, giải thưởng (mục Về chúng tôi)' },
  { value: 'offices', label: 'Văn phòng, chi nhánh (chân trang, liên hệ)' },
];

const seo = [
  { name: 'seo_title', label: 'Tiêu đề SEO (để trống sẽ dùng tiêu đề)', type: 'text', group: 'SEO' },
  { name: 'seo_desc', label: 'Mô tả SEO', type: 'textarea', group: 'SEO' },
];

const RESOURCES = {
  banners: {
    label: 'Banner trang chủ', singular: 'banner', table: 'banners', order: 'sort, id',
    hint: 'Có nhiều banner đang bật thì trang chủ tự chuyển lần lượt. Không có ảnh thì hiện bảng điều hành minh họa.',
    list: ['title', 'cta1_label', 'sort', 'active'],
    fields: [
      { name: 'badge', label: 'Nhãn nhỏ phía trên', type: 'text' },
      { name: 'title', label: 'Thông điệp chính (xuống dòng bằng Enter)', type: 'textarea', required: true },
      { name: 'subtitle', label: 'Mô tả', type: 'textarea' },
      { name: 'image', label: 'Ảnh minh họa bên phải', type: 'image' },
      { name: 'cta1_label', label: 'Nút chính', type: 'text' },
      { name: 'cta1_url', label: 'Liên kết nút chính', type: 'text' },
      { name: 'cta2_label', label: 'Nút phụ', type: 'text' },
      { name: 'cta2_url', label: 'Liên kết nút phụ', type: 'text' },
      { name: 'sort', label: 'Thứ tự', type: 'number' },
      { name: 'active', label: 'Đang hiển thị', type: 'checkbox' },
    ],
  },
  menu: {
    label: 'Menu và liên kết', singular: 'liên kết', table: 'menu_items', order: 'location, sort, id',
    hint: 'Menu đầu trang và các cột liên kết ở chân trang. Tiêu đề các cột đặt trong Cấu hình website, thẻ Chân trang.',
    filter: { name: 'location', options: MENU_LOCATIONS },
    list: ['label', 'url', 'location', 'sort', 'active'],
    fields: [
      { name: 'location', label: 'Vị trí', type: 'select', options: MENU_LOCATIONS, required: true },
      { name: 'label', label: 'Nhãn', type: 'text', required: true },
      { name: 'url', label: 'Liên kết (ví dụ /giai-phap hoặc https://...)', type: 'text', required: true },
      { name: 'new_tab', label: 'Mở trong thẻ mới', type: 'checkbox' },
      { name: 'sort', label: 'Thứ tự', type: 'number' },
      { name: 'active', label: 'Đang hiển thị', type: 'checkbox' },
    ],
  },
  blocks: {
    label: 'Khối trang chủ', singular: 'khối', table: 'blocks', order: 'grp, sort, id',
    hint: 'Số liệu, các bước làm việc, thẻ đổi mới và chứng nhận hiển thị trên trang chủ.',
    filter: { name: 'grp', options: BLOCK_GROUPS },
    list: ['value', 'title', 'grp', 'sort', 'active'],
    fields: [
      { name: 'grp', label: 'Nhóm', type: 'select', options: BLOCK_GROUPS, required: true },
      { name: 'value', label: 'Con số hoặc nhãn ngắn (ví dụ 20 năm, Bước 01)', type: 'text' },
      { name: 'title', label: 'Tiêu đề', type: 'text' },
      { name: 'body', label: 'Mô tả (với Các mảng hoạt động: mỗi dòng là một gạch đầu dòng)', type: 'textarea' },
      { name: 'icon', label: 'Biểu tượng', type: 'select', options: [{ value: '', label: 'Không dùng' }, ...ICON_OPTIONS] },
      { name: 'url', label: 'Liên kết (không bắt buộc)', type: 'text' },
      { name: 'sort', label: 'Thứ tự', type: 'number' },
      { name: 'active', label: 'Đang hiển thị', type: 'checkbox' },
    ],
  },
  solutions: {
    label: 'Giải pháp', singular: 'giải pháp', table: 'solutions', order: 'sort, id', slugFrom: 'title', publicPath: '/giai-phap/',
    list: ['title', 'slug', 'sort', 'active'],
    fields: [
      { name: 'title', label: 'Tên giải pháp', type: 'text', required: true },
      { name: 'slug', label: 'Đường dẫn (tự tạo nếu để trống)', type: 'slug' },
      { name: 'tag', label: 'Nhóm, lĩnh vực (ví dụ Chính quyền số, GIS)', type: 'text' },
      { name: 'icon', label: 'Biểu tượng', type: 'select', options: ICON_OPTIONS },
      { name: 'summary', label: 'Mô tả ngắn trên thẻ', type: 'textarea' },
      { name: 'kicker', label: 'Nhãn nhỏ đầu trang', type: 'text', group: 'Đầu trang' },
      { name: 'hero_title', label: 'Thông điệp đầu trang giải pháp', type: 'textarea', group: 'Đầu trang' },
      { name: 'demo_url', label: 'Liên kết Live Demo (để trống sẽ dẫn tới form đăng ký)', type: 'text', group: 'Đầu trang' },
      { name: 'hero_text', label: 'Mô tả đầu trang', type: 'textarea', group: 'Đầu trang' },
      { name: 'image', label: 'Ảnh giao diện sản phẩm', type: 'image', group: 'Đầu trang' },
      { name: 'brochure', label: 'Tài liệu giới thiệu (PDF)', type: 'file', group: 'Đầu trang' },
      { name: 'pains', label: 'Bài toán thường gặp', type: 'repeater', group: 'Nội dung', sub: [
        { name: 'title', label: 'Tiêu đề' }, { name: 'text', label: 'Mô tả', type: 'textarea' }] },
      { name: 'modules', label: 'Các phân hệ', type: 'repeater', group: 'Nội dung', sub: [
        { name: 'title', label: 'Tên phân hệ' }, { name: 'text', label: 'Mô tả', type: 'textarea' }] },
      { name: 'results', label: 'Kết quả (số liệu)', type: 'repeater', group: 'Nội dung', sub: [
        { name: 'value', label: 'Con số' }, { name: 'label', label: 'Ý nghĩa' }] },
      { name: 'results_note', label: 'Ghi chú nguồn số liệu', type: 'text', group: 'Nội dung' },
      { name: 'compliance', label: 'Tuân thủ quy định', type: 'repeater', group: 'Nội dung', sub: [
        { name: 'text', label: 'Nội dung' }] },
      { name: 'faqs', label: 'Câu hỏi thường gặp', type: 'repeater', group: 'Nội dung', sub: [
        { name: 'q', label: 'Câu hỏi' }, { name: 'a', label: 'Trả lời', type: 'textarea' }] },
      { name: 'content', label: 'Nội dung bổ sung', type: 'richtext', group: 'Nội dung' },
      ...seo,
      { name: 'sort', label: 'Thứ tự', type: 'number' },
      { name: 'active', label: 'Đang hiển thị', type: 'checkbox' },
    ],
  },
  projects: {
    label: 'Dự án tiêu biểu', singular: 'dự án', table: 'projects', order: 'sort, id', slugFrom: 'title', publicPath: '/du-an/',
    list: ['title', 'category', 'featured', 'active'],
    fields: [
      { name: 'title', label: 'Tên dự án', type: 'text', required: true },
      { name: 'slug', label: 'Đường dẫn (tự tạo nếu để trống)', type: 'slug' },
      { name: 'client', label: 'Đơn vị khách hàng', type: 'text' },
      { name: 'category', label: 'Lĩnh vực (dùng làm bộ lọc)', type: 'text', datalist: 'project_categories' },
      { name: 'result', label: 'Kết quả nổi bật (có con số)', type: 'textarea' },
      { name: 'image', label: 'Ảnh triển khai thực tế', type: 'image' },
      { name: 'content', label: 'Câu chuyện dự án', type: 'richtext' },
      { name: 'featured', label: 'Hiện trên trang chủ', type: 'checkbox' },
      ...seo,
      { name: 'sort', label: 'Thứ tự', type: 'number' },
      { name: 'active', label: 'Đang hiển thị', type: 'checkbox' },
    ],
  },
  posts: {
    label: 'Tin tức, bài viết', singular: 'bài viết', table: 'posts', order: 'published_at DESC, id DESC', slugFrom: 'title', publicPath: '/tin-tuc/',
    list: ['title', 'category', 'status', 'published_at'],
    search: ['title', 'excerpt'],
    fields: [
      { name: 'title', label: 'Tiêu đề', type: 'text', required: true },
      { name: 'slug', label: 'Đường dẫn (tự tạo nếu để trống)', type: 'slug' },
      { name: 'category', label: 'Chuyên mục', type: 'text', datalist: 'post_categories' },
      { name: 'excerpt', label: 'Tóm tắt', type: 'textarea' },
      { name: 'cover', label: 'Ảnh đại diện', type: 'image' },
      { name: 'content', label: 'Nội dung', type: 'richtext' },
      { name: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'draft', label: 'Bản nháp' }, { value: 'published', label: 'Đã đăng' }] },
      { name: 'published_at', label: 'Ngày đăng', type: 'datetime' },
      ...seo,
    ],
  },
  clients: {
    label: 'Khách hàng (logo)', singular: 'khách hàng', table: 'clients', order: 'sort, id',
    list: ['name', 'logo', 'sort', 'active'],
    fields: [
      { name: 'name', label: 'Tên đơn vị', type: 'text', required: true },
      { name: 'logo', label: 'Logo', type: 'image' },
      { name: 'url', label: 'Trang web (không bắt buộc)', type: 'text' },
      { name: 'sort', label: 'Thứ tự', type: 'number' },
      { name: 'active', label: 'Đang hiển thị', type: 'checkbox' },
    ],
  },
  testimonials: {
    label: 'Cảm nhận khách hàng', singular: 'cảm nhận', table: 'testimonials', order: 'sort, id',
    list: ['name', 'org', 'sort', 'active'],
    fields: [
      { name: 'quote', label: 'Lời cảm nhận', type: 'textarea', required: true },
      { name: 'name', label: 'Họ tên', type: 'text', required: true },
      { name: 'role', label: 'Chức vụ', type: 'text' },
      { name: 'org', label: 'Cơ quan, đơn vị', type: 'text' },
      { name: 'avatar', label: 'Ảnh chân dung', type: 'image' },
      { name: 'sort', label: 'Thứ tự', type: 'number' },
      { name: 'active', label: 'Đang hiển thị', type: 'checkbox' },
    ],
  },
  pages: {
    label: 'Trang tĩnh', singular: 'trang', table: 'pages', order: 'id', slugFrom: 'title', publicPath: '/',
    hint: 'Giới thiệu, Tuyển dụng, Điều khoản, Chính sách... Mỗi trang có đường dẫn riêng, gắn vào menu tùy ý.',
    list: ['title', 'slug', 'active'],
    fields: [
      { name: 'title', label: 'Tiêu đề', type: 'text', required: true },
      { name: 'slug', label: 'Đường dẫn (tự tạo nếu để trống)', type: 'slug' },
      { name: 'lead', label: 'Đoạn mở đầu', type: 'textarea' },
      { name: 'content', label: 'Nội dung', type: 'richtext' },
      ...seo,
      { name: 'active', label: 'Đang hiển thị', type: 'checkbox' },
    ],
  },
  users: {
    label: 'Tài khoản quản trị', singular: 'tài khoản', table: 'users', order: 'id', adminOnly: true,
    list: ['email', 'name', 'role', 'active'],
    fields: [
      { name: 'email', label: 'Email đăng nhập', type: 'text', required: true },
      { name: 'name', label: 'Họ tên', type: 'text' },
      { name: 'password', label: 'Mật khẩu (để trống nếu không đổi, tối thiểu 10 ký tự)', type: 'password' },
      { name: 'role', label: 'Vai trò', type: 'select', options: [{ value: 'editor', label: 'Biên tập viên' }, { value: 'admin', label: 'Quản trị viên' }] },
      { name: 'active', label: 'Đang hoạt động', type: 'checkbox' },
    ],
  },
};

module.exports = { RESOURCES, MENU_LOCATIONS, BLOCK_GROUPS };
