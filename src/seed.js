// Dữ liệu khởi tạo theo nội dung thật đã thu thập từ trithucsoft.vn và bản thiết kế đã duyệt.
// Những chỗ trong ngoặc vuông [ ] là thông tin còn thiếu; trang Tổng quan trong quản trị liệt kê để cập nhật.
module.exports = async function seed(q) {
  const ins = async (table, rows) => {
    for (const r of rows) {
      const keys = Object.keys(r);
      const vals = keys.map(k => (typeof r[k] === 'object' && r[k] !== null) ? JSON.stringify(r[k]) : r[k]);
      await q(`INSERT INTO ${table}(${keys.join(',')}) VALUES (${keys.map((_, i) => '$' + (i + 1)).join(',')})`, vals);
    }
  };
  const m = (location, label, url, sort) => ({ location, label, url, sort });

  await ins('menu_items', [
    m('header', 'Giới thiệu', '/gioi-thieu', 1),
    m('header', 'Giải pháp phần mềm', '/giai-phap', 2),
    m('header', 'Tư vấn CNTT', '/tu-van-cntt', 3),
    m('header', 'Phần mềm bản quyền', '/phan-mem-ban-quyen', 4),
    m('header', 'Dự án', '/du-an', 5),
    m('header', 'Tin tức', '/tin-tuc', 6),
    m('footer_1', 'Giải pháp phần mềm', '/giai-phap', 1),
    m('footer_1', 'Tư vấn CNTT', '/tu-van-cntt', 2),
    m('footer_1', 'Phần mềm bản quyền', '/phan-mem-ban-quyen', 3),
    m('footer_1', 'Dự án tiêu biểu', '/du-an', 4),
    m('footer_1', 'Liên hệ', '/lien-he', 5),
    m('footer_legal', 'Chính sách chung', '/chinh-sach-chung', 1),
    m('footer_legal', 'Điều khoản sử dụng', '/dieu-khoan-su-dung', 2),
    m('footer_legal', 'Chính sách bảo mật', '/chinh-sach-bao-mat', 3),
  ]);

  await ins('banners', [{
    badge: '',
    title: 'Công nghệ và Tri thức\ncho quản lý hiện đại.',
    subtitle: 'Tri Thức đồng hành cùng cơ quan nhà nước và doanh nghiệp trong hiện đại hóa quản lý, điều hành và khai thác dữ liệu. Từ tư vấn, xây dựng phần mềm đến vận hành, chúng tôi giúp tổ chức làm việc hiệu quả, minh bạch và bền vững.',
    cta1_label: 'Đặt lịch tư vấn miễn phí', cta1_url: '/lien-he',
    cta2_label: 'Xem các giải pháp', cta2_url: '/giai-phap', sort: 1,
  }]);

  const b = (grp, sort, o) => ({ grp, sort, ...o });
  await ins('blocks', [
    b('stats', 1, { value: '20 năm', body: 'kinh nghiệm phần mềm và chuyển đổi số', active: false }),
    b('stats', 2, { value: '6', body: 'giải pháp phần mềm có demo trực tuyến', active: false }),
    b('stats', 3, { value: '7', body: 'dịch vụ tư vấn dự án CNTT trọn chu trình', active: false }),
    b('stats', 4, { value: '3', body: 'văn phòng tại TP.HCM, Thủ Đức và Cần Thơ', active: false }),

    b('areas', 1, { icon: 'code', title: 'Giải pháp phần mềm', value: 'Xem 6 giải pháp', url: '/giai-phap',
      body: 'Phần mềm quản lý chuyên ngành\nHệ thống điều hành công việc\nBản đồ số GIS, AI, Big Data\nKho dữ liệu số và nền tảng tích hợp' }),
    b('areas', 2, { icon: 'consult', title: 'Tư vấn chuyển đổi số', value: 'Xem 7 dịch vụ tư vấn', url: '/tu-van-cntt',
      body: 'Tư vấn chuyển đổi số cho tổ chức\nQuản lý dự án, thiết kế, giám sát, kiểm thử, đấu thầu\nSố hóa và quản trị dữ liệu\nĐào tạo, chuyển giao công nghệ' }),
    b('areas', 3, { icon: 'shield', title: 'Bản quyền và an toàn thông tin', value: 'Xem sản phẩm bản quyền', url: '/phan-mem-ban-quyen',
      body: 'Windows, Microsoft Office, Microsoft 365 bản quyền\nPhần mềm diệt virus và bảo mật\nAutoCAD, Vietmap và phần mềm chuyên dụng\nGiải pháp an toàn thông tin' }),

    ...['Quản lý dự án đầu tư ứng dụng CNTT', 'Lập báo cáo kinh tế kỹ thuật, nghiên cứu khả thi và thiết kế dự án', 'Thẩm tra hồ sơ thiết kế',
      'Lập hồ sơ mời thầu và đánh giá hồ sơ dự thầu', 'Thẩm định hồ sơ mời thầu và kết quả lựa chọn nhà thầu', 'Giám sát dự án CNTT',
      'Kiểm thử và vận hành thử hệ thống CNTT'].map((t, i) => b('consulting', i + 1, { title: t })),

    b('process', 1, { value: 'Bước 01', title: 'Khảo sát', body: 'Làm việc tại đơn vị để hiểu quy trình thực tế và mục tiêu cần đạt.' }),
    b('process', 2, { value: 'Bước 02', title: 'Tư vấn', body: 'Đề xuất giải pháp phù hợp thực tiễn, đúng quy định hiện hành.' }),
    b('process', 3, { value: 'Bước 03', title: 'Báo giá', body: 'Phạm vi, tiến độ và chi phí rõ ràng trước khi bắt đầu.' }),
    b('process', 4, { value: 'Bước 04', title: 'Triển khai', body: 'Cài đặt, chuyển đổi dữ liệu, đào tạo và chuyển giao cho người dùng.' }),
    b('process', 5, { value: 'Bước 05', title: 'Hỗ trợ và bảo trì', body: 'Hỗ trợ nhanh chóng, lâu dài, nâng cấp khi nghiệp vụ thay đổi.' }),

    b('licenses', 1, { title: 'Microsoft', body: 'Windows 11, Windows Server 2025, Office LTSC 2024, Microsoft 365 Business', value: '7 sản phẩm' }),
    b('licenses', 2, { title: 'Bảo mật', body: 'Bkav Pro Internet Security, Bkav Safe Kids, Kaspersky Standard', value: '5 sản phẩm' }),
    b('licenses', 3, { title: 'Thiết kế', body: 'AutoCAD Full Toolsets 2027, AutoCAD LT 2027', value: '2 sản phẩm' }),
    b('licenses', 4, { title: 'Vietmap Live', body: 'Vietmap Live Pro gói 12 tháng và 24 tháng', value: 'Từ 500.000 đồng' }),

    b('innovation', 1, { icon: 'map', title: 'Bản đồ số GIS', body: 'Trực quan hóa dữ liệu theo không gian, từ điểm bỏ phiếu đến cảng bến và hạ tầng.' }),
    b('innovation', 2, { icon: 'ai', title: 'Trí tuệ nhân tạo', body: 'Hỗ trợ phân tích, tổng hợp và gợi ý xử lý, giúp cán bộ tiết kiệm thời gian.' }),
    b('innovation', 3, { icon: 'database', title: 'Big Data và kho dữ liệu', body: 'Tích hợp dữ liệu doanh nghiệp, thuế, BHXH phục vụ lãnh đạo điều hành.' }),
    b('innovation', 4, { icon: 'rfid', title: 'RFID và số hóa lưu trữ', body: 'Định vị, kiểm kê, truy vết hồ sơ giấy và chuyển đổi sang kho lưu trữ số.' }),

    ...['Giải pháp phù hợp thực tiễn', 'Kinh nghiệm triển khai nhiều lĩnh vực', 'Đồng hành từ tư vấn đến vận hành', 'Hỗ trợ nhanh chóng, lâu dài']
      .map((t, i) => b('about_points', i + 1, { title: t })),

    b('offices', 1, { title: 'Trụ sở', body: 'Tầng 3, Tòa nhà An Phú Plaza, 117-119 Lý Chính Thắng, phường Xuân Hòa, TP. Hồ Chí Minh' }),
    b('offices', 2, { title: 'Văn phòng Thủ Đức', body: '74/3k/1 Đường 36, phường Thủ Đức, TP. Hồ Chí Minh' }),
    b('offices', 3, { title: 'Chi nhánh Cần Thơ', body: '52 Đường B2, phường Hưng Phú, TP. Cần Thơ' }),
  ]);

  const sol = (sort, slug, title, tag, icon, summary, extra = {}) => ({ sort, slug, title, tag, icon, summary, hero_title: title, hero_text: summary, ...extra });
  await ins('solutions', [
    sol(1, 'quan-ly-dieu-hanh-cap-xa-phuong', 'Quản lý điều hành cấp xã, phường', 'Chính quyền số', 'gov',
      'Nhiệm vụ, công việc, dự án, kế hoạch, lịch họp và đánh giá KPI trên một hệ thống.', {
        kicker: 'Chuyển đổi số cấp xã, phường',
        hero_title: 'Giao việc rõ, theo dõi sát, đánh giá công bằng',
        hero_text: 'Giải pháp chuyển đổi số trong quản lý điều hành cấp xã, phường: nhiệm vụ, công việc, dự án, kế hoạch, lịch họp và đánh giá KPI trên một hệ thống, lãnh đạo nắm tình hình mọi lúc.',
        pains: [
          { title: 'Giao việc qua nhiều kênh', text: 'Nhiệm vụ giao qua giấy, điện thoại, Zalo, khó tổng hợp và dễ bỏ sót.' },
          { title: 'Khó theo dõi tiến độ', text: 'Lãnh đạo khó biết việc nào đang chậm, ai đang xử lý, kế hoạch đạt bao nhiêu phần trăm.' },
          { title: 'Đánh giá thiếu số liệu', text: 'Đánh giá cán bộ cuối kỳ chủ yếu dựa vào cảm tính vì thiếu dữ liệu công việc hằng ngày.' },
        ],
        modules: [
          { title: 'Nhiệm vụ, công việc', text: 'Giao việc, theo dõi tiến độ, nhắc hạn và báo cáo kết quả xử lý.' },
          { title: 'Dự án, kế hoạch', text: 'Quản lý danh mục dự án, kế hoạch năm, quý và mức độ hoàn thành.' },
          { title: 'Lịch họp', text: 'Đăng ký, duyệt và thông báo lịch họp, lịch công tác của lãnh đạo.' },
          { title: 'Đánh giá KPI', text: 'Chấm điểm theo kết quả công việc thực tế, minh bạch cho từng cán bộ.' },
        ],
        results: [
          { value: '[X]%', label: 'nhiệm vụ hoàn thành đúng hạn' },
          { value: '[X]', label: 'cán bộ đang sử dụng' },
          { value: '[X]', label: 'xã, phường đang vận hành' },
        ],
        results_note: 'Số liệu tổng hợp đến [ngày], nguồn: [tên đơn vị]',
        compliance: [
          { text: 'Kết nối nền tảng dùng chung của tỉnh, thành phố' },
          { text: 'An toàn hệ thống thông tin theo cấp độ [cấp độ]' },
          { text: 'Phân quyền theo vai trò lãnh đạo, chuyên viên' },
          { text: 'Dùng tốt trên máy tính và điện thoại' },
        ],
        faqs: [
          { q: 'Triển khai mất bao lâu?', a: 'Thường từ [X] đến [Y] tuần tùy quy mô, gồm khảo sát, cấu hình quy trình, chuyển dữ liệu cũ và đào tạo.' },
          { q: 'Có kết nối được với hệ thống hiện có của đơn vị không?', a: 'Có. Giải pháp hỗ trợ kết nối qua API với các nền tảng dùng chung và phần mềm đơn vị đang dùng.' },
          { q: 'Cán bộ ở xã, phường có dùng được không?', a: 'Giao diện chữ lớn, thao tác ít bước, có hướng dẫn ngay trên màn hình. Tri Thức đào tạo trực tiếp tại đơn vị.' },
          { q: 'Sau khi bàn giao, ai hỗ trợ khi có sự cố?', a: 'Đội hỗ trợ của Tri Thức tiếp nhận qua hotline, Zalo 088 679 2809 và email trithuc@trithucsoft.vn.' },
        ],
      }),
    sol(2, 'gis-va-ban-do-so', 'GIS và bản đồ số', 'GIS', 'map',
      'Bản đồ tuyên truyền bầu cử, tra cứu điểm bỏ phiếu, chỉ đường và thông tin ứng cử viên.'),
    sol(3, 'cap-phep-ra-vao-cang-ben-thuy-noi-dia', 'Cấp phép ra, vào cảng, bến thủy nội địa', 'Giao thông thủy', 'ship',
      'Cấp phép phương tiện ra, vào cảng, bến thủy nội địa và khu neo đậu trực tuyến.'),
    sol(4, 'xu-phat-vi-pham-hanh-chinh-cang-ben', 'Xử phạt vi phạm hành chính cảng bến', 'Giao thông thủy', 'gavel',
      'Lập, theo dõi và tra cứu hồ sơ xử phạt vi phạm hành chính trong quản lý cảng bến.'),
    sol(5, 'kho-luu-tru-so-rfid', 'Kho lưu trữ số RFID', 'Lưu trữ', 'rfid',
      'Quản lý hộp hồ sơ, định vị, kiểm kê và truy vết bằng thẻ RFID.'),
    sol(6, 'nang-cap-cong-thong-tin-dien-tu', 'Nâng cấp cổng thông tin điện tử', 'Cổng thông tin', 'globe',
      'Hiện đại hóa cổng thông tin cho tỉnh, sở ngành và trường đại học.'),
  ]);

  const pj = (sort, slug, title, category, client, result) => ({ sort, slug, title, category, client, result, featured: sort <= 3 });
  await ins('projects', [
    pj(1, 'ban-do-so-gis-tuyen-truyen-bau-cu-can-tho', 'Bản đồ số GIS tuyên truyền bầu cử ĐBQH khóa XVI và HĐND các cấp', 'GIS và bản đồ số', 'Sở Nội vụ TP. Cần Thơ', 'Tra cứu điểm bỏ phiếu, chỉ đường và thông tin ứng cử viên.'),
    pj(2, 'nang-cap-cong-thong-tin-dien-tu-tinh-ben-tre', 'Nâng cấp Cổng thông tin điện tử tỉnh Bến Tre', 'Cổng thông tin', 'Văn phòng UBND tỉnh Bến Tre', 'Hiện đại hóa cổng thông tin điện tử cấp tỉnh.'),
    pj(3, 'csdl-doanh-nghiep-tich-hop-thue-bhxh-hau-giang', 'CSDL doanh nghiệp tích hợp thông tin thuế, BHXH phục vụ lãnh đạo UBND tỉnh', 'Dữ liệu', 'Sở KH&ĐT Hậu Giang', 'Kho dữ liệu doanh nghiệp tích hợp thuế, BHXH phục vụ lãnh đạo điều hành.'),
    pj(4, 'quan-ly-giam-sat-xe-cho-rac-bac-ninh', 'Phần mềm quản lý, giám sát xe chở rác và khối lượng rác thải', 'Môi trường', 'Sở TN&MT Bắc Ninh', 'Giám sát hành trình xe chở rác và khối lượng rác thải.'),
    pj(5, 'ung-dung-cntt-dieu-hanh-gtvt-ben-tre', 'Ứng dụng CNTT điều hành giao thông vận tải giai đoạn 2021 - 2025', 'Giao thông thủy', 'Sở GTVT Bến Tre', 'Cấp phép cảng, bến thủy nội địa và dịch vụ công trực tuyến.'),
    pj(6, 'co-so-du-lieu-nganh-cong-thuong-ca-mau', 'Cơ sở dữ liệu ngành Công Thương', 'Dữ liệu', 'Sở Công Thương Cà Mau', 'Cơ sở dữ liệu tập trung phục vụ quản lý ngành Công Thương.'),
  ]);

  await ins('posts', [
    { slug: 'ban-do-so-gis-tuyen-truyen-bau-cu-tai-tp-can-tho', title: 'Bản đồ số GIS tuyên truyền bầu cử tại TP. Cần Thơ', category: 'Phát triển phần mềm', status: 'published',
      excerpt: 'Tri Thức cùng Sở Nội vụ TP. Cần Thơ đưa bản đồ số vào công tác tuyên truyền bầu cử, giúp cử tri tra cứu điểm bỏ phiếu và thông tin ứng cử viên.',
      content: '<p>[Nội dung bài viết. Cập nhật trong trang quản trị, mục Tin tức.]</p>' },
    { slug: 'bai-viet-hoat-dong-tu-van-mau', title: '[Tiêu đề bài viết mới nhất trong mục Hoạt động tư vấn]', category: 'Hoạt động tư vấn', status: 'draft',
      excerpt: '', content: '<p>[Nội dung bài viết.]</p>' },
    { slug: 'bai-viet-tin-ve-tri-thuc-mau', title: '[Tiêu đề bài viết mới nhất trong mục Tin về Tri Thức]', category: 'Tin về Tri Thức', status: 'draft',
      excerpt: '', content: '<p>[Nội dung bài viết.]</p>' },
  ]);

  await ins('clients', ['Sở Nội vụ TP. Cần Thơ', 'Sở TN&MT Bắc Ninh', 'Văn phòng UBND tỉnh Bến Tre', 'Văn phòng Tỉnh ủy Vĩnh Long',
    'Sở Công Thương Cà Mau', 'Trường ĐH Nông Lâm TP.HCM'].map((name, i) => ({ name, sort: i + 1, active: false })));

  await ins('testimonials', [{
    quote: '[Cảm nhận của khách hàng: một hai câu về kết quả cụ thể sau khi dùng sản phẩm của Tri Thức.]',
    name: '[Họ tên]', role: '[Chức vụ]', org: '[Tên cơ quan]', sort: 1, active: false,
  }]);

  const page = (slug, title, lead, content) => ({ slug, title, lead, content });
  await ins('pages', [
    page('gioi-thieu', 'Về Tri Thức', 'Làm thật, làm kỹ, đồng hành lâu dài cùng khách hàng.',
      '<p>Thành lập năm 2006, Công ty Cổ phần Tin học Tri Thức hướng tới trở thành đơn vị công nghệ đồng hành hiệu quả trong hiện đại hóa quản lý, điều hành và khai thác dữ liệu.</p><h2>Phương châm</h2><p><strong>Uy tín, Chuyên nghiệp, Đồng hành phát triển.</strong></p><h2>Vì sao chọn Tri Thức</h2><ul><li>Giải pháp phù hợp thực tiễn</li><li>Kinh nghiệm triển khai nhiều lĩnh vực</li><li>Đồng hành từ tư vấn đến vận hành</li><li>Hỗ trợ nhanh chóng, lâu dài</li></ul>'),
    page('tu-van-cntt', 'Tư vấn CNTT', 'Tư vấn dự án ứng dụng CNTT từ lúc lập đến lúc nghiệm thu, đúng quy định đầu tư công và đấu thầu.',
      '<h2>7 dịch vụ tư vấn</h2><ol><li>Quản lý dự án đầu tư ứng dụng CNTT</li><li>Lập báo cáo kinh tế kỹ thuật, nghiên cứu khả thi và thiết kế dự án</li><li>Thẩm tra hồ sơ thiết kế</li><li>Lập hồ sơ mời thầu và đánh giá hồ sơ dự thầu</li><li>Thẩm định hồ sơ mời thầu và kết quả lựa chọn nhà thầu</li><li>Giám sát dự án CNTT</li><li>Kiểm thử và vận hành thử hệ thống CNTT</li></ol><p>Ngoài ra, Tri Thức tư vấn chuyển đổi số cho tổ chức, số hóa và quản trị dữ liệu, đào tạo và chuyển giao công nghệ.</p>'),
    page('phan-mem-ban-quyen', 'Phần mềm bản quyền', 'Phần mềm chính hãng, xuất hóa đơn đầy đủ cho đơn vị.',
      '<h2>Microsoft</h2><p>Windows 11, Windows Server 2025, Office LTSC 2024, Microsoft 365 Business.</p><h2>Bảo mật</h2><p>Bkav Pro Internet Security, Bkav Safe Kids, Kaspersky Standard.</p><h2>Thiết kế</h2><p>AutoCAD Full Toolsets 2027, AutoCAD LT 2027.</p><h2>Vietmap Live</h2><p>Vietmap Live Pro gói 12 tháng và 24 tháng, từ 500.000 đồng.</p><p>[Bảng giá chi tiết. Liên hệ hotline 088 679 2809 để nhận báo giá.]</p>'),
    page('chinh-sach-chung', 'Chính sách chung', '', '<p>[Nội dung chính sách chung.]</p>'),
    page('dieu-khoan-su-dung', 'Điều khoản sử dụng', '', '<p>[Nội dung điều khoản sử dụng.]</p>'),
    page('chinh-sach-bao-mat', 'Chính sách bảo mật', '', '<p>[Nội dung chính sách bảo mật.]</p>'),
    page('bao-ve-du-lieu-ca-nhan', 'Chính sách bảo vệ dữ liệu cá nhân', 'Theo Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân.', '<p>[Mục đích thu thập, loại dữ liệu, thời gian lưu trữ, quyền của chủ thể dữ liệu và cách liên hệ.]</p>'),
  ]);

  const settings = {
    address: 'Tầng 3, Tòa nhà An Phú Plaza, 117-119 Lý Chính Thắng, phường Xuân Hòa, TP. Hồ Chí Minh',
    tax_code: '0304363608', hotline: '088 679 2809', email: 'trithuc@trithucsoft.vn',
    social_zalo: 'https://zalo.me/0886792809',
  };
  for (const [k, v] of Object.entries(settings)) {
    await q('INSERT INTO settings(key, value) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING', [k, v]);
  }
};
