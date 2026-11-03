// Nội dung khởi tạo chi tiết cho giải pháp, dự án và trang pháp lý.
// Không ghi số liệu chưa được Tri Thức xác nhận; số liệu thật bổ sung trong trang quản trị.

const L = (...rows) => rows.map(([title, text]) => ({ title, text }));
const C = (...rows) => rows.map(text => ({ text }));
const F = (...rows) => rows.map(([q, a]) => ({ q, a }));

const SUPPORT = 'Đội hỗ trợ của Tri Thức tiếp nhận qua hotline, Zalo 088 679 2809 và email trithuc@trithucsoft.vn, theo dõi đến khi xử lý xong.';

exports.solutions = {
  'quan-ly-dieu-hanh-cap-xa-phuong': {
    results: [],
    results_note: '',
    compliance: C('Kết nối nền tảng dùng chung của tỉnh, thành phố', 'Bảo đảm an toàn hệ thống thông tin theo cấp độ', 'Phân quyền theo vai trò lãnh đạo, chuyên viên', 'Dùng tốt trên máy tính và điện thoại'),
    faqs: F(
      ['Triển khai mất bao lâu?', 'Tùy quy mô đơn vị. Tri Thức khảo sát trước, sau đó thống nhất kế hoạch gồm cấu hình quy trình, chuyển dữ liệu cũ và đào tạo.'],
      ['Có kết nối được với hệ thống hiện có của đơn vị không?', 'Có. Giải pháp hỗ trợ kết nối qua API với các nền tảng dùng chung và phần mềm đơn vị đang dùng.'],
      ['Cán bộ ở xã, phường có dùng được không?', 'Giao diện chữ lớn, thao tác ít bước, có hướng dẫn ngay trên màn hình. Tri Thức đào tạo trực tiếp tại đơn vị.'],
      ['Sau khi bàn giao, ai hỗ trợ khi có sự cố?', SUPPORT],
    ),
  },

  'gis-va-ban-do-so': {
    kicker: 'Dữ liệu theo không gian',
    hero_title: 'Đặt dữ liệu lên bản đồ để thấy rõ và quyết nhanh',
    hero_text: 'Nền tảng GIS và bản đồ số giúp cơ quan quản lý hiển thị, tra cứu và phân tích dữ liệu theo vị trí: điểm bỏ phiếu, hạ tầng, cảng bến, đối tượng quản lý. Người dân tra cứu dễ, lãnh đạo nhìn tổng thể trên một màn hình.',
    pains: L(
      ['Dữ liệu nằm rời trong bảng tính', 'Thông tin có vị trí nhưng chỉ lưu dạng danh sách, khó hình dung phân bố và mật độ.'],
      ['Người dân khó tra cứu', 'Tìm địa điểm, đường đi, thông tin liên quan phải hỏi qua nhiều kênh.'],
      ['Cập nhật chậm', 'Bản đồ in hoặc ảnh tĩnh nhanh lỗi thời, mỗi lần thay đổi phải làm lại từ đầu.'],
    ),
    modules: L(
      ['Quản lý lớp bản đồ', 'Tạo, phân lớp và cập nhật dữ liệu điểm, đường, vùng ngay trên trình duyệt.'],
      ['Tra cứu và chỉ đường', 'Người dùng tìm theo tên, địa chỉ hoặc vị trí hiện tại và được chỉ đường đến nơi.'],
      ['Thống kê theo vùng', 'Tổng hợp số liệu theo phường, xã, quận, huyện và hiển thị bằng màu, biểu đồ.'],
      ['Kết nối dữ liệu', 'Nhận dữ liệu từ phần mềm nghiệp vụ, tệp Excel, bản đồ nền mở và dịch vụ bản đồ tiêu chuẩn.'],
    ),
    compliance: C('Hệ tọa độ quốc gia VN-2000 và WGS84', 'Chuẩn dịch vụ bản đồ WMS, WFS', 'Phân quyền xem và chỉnh sửa theo đơn vị', 'Dùng tốt trên điện thoại cho người dân'),
    faqs: F(
      ['Đơn vị chưa có dữ liệu bản đồ thì sao?', 'Tri Thức hỗ trợ số hóa từ danh sách địa chỉ, tệp Excel hoặc bản vẽ có sẵn và đối chiếu thực địa khi cần.'],
      ['Có dùng được cho sự kiện ngắn hạn như bầu cử không?', 'Được. Hệ thống dựng nhanh theo mẫu, cập nhật trong suốt sự kiện và lưu trữ sau khi kết thúc.'],
      ['Sau khi bàn giao, ai hỗ trợ khi có sự cố?', SUPPORT],
    ),
  },

  'cap-phep-ra-vao-cang-ben-thuy-noi-dia': {
    kicker: 'Giao thông thủy nội địa',
    hero_title: 'Cấp phép ra, vào cảng bến nhanh, đúng quy trình',
    hero_text: 'Phần mềm tiếp nhận và xử lý đề nghị cấp phép cho phương tiện ra, vào cảng, bến thủy nội địa và khu neo đậu. Chủ phương tiện nộp hồ sơ trực tuyến, cán bộ cảng vụ xử lý và lưu vết đầy đủ.',
    pains: L(
      ['Hồ sơ giấy, đi lại nhiều', 'Chủ phương tiện phải đến trực tiếp, chờ đợi, dễ thiếu giấy tờ.'],
      ['Khó tra cứu lịch sử', 'Tìm lại giấy phép, thông tin phương tiện và thuyền viên mất nhiều thời gian.'],
      ['Báo cáo tổng hợp thủ công', 'Số lượt ra, vào và sản lượng phải cộng tay từ sổ sách.'],
    ),
    modules: L(
      ['Tiếp nhận trực tuyến', 'Nộp đề nghị cấp phép, đính kèm giấy tờ và theo dõi trạng thái xử lý.'],
      ['Xử lý và cấp phép', 'Kiểm tra hồ sơ, phê duyệt, cấp giấy phép điện tử theo đúng mẫu quy định.'],
      ['Quản lý phương tiện, thuyền viên', 'Lưu thông tin đăng ký, đăng kiểm, chứng chỉ và cảnh báo khi sắp hết hạn.'],
      ['Thống kê, báo cáo', 'Tổng hợp lượt ra, vào và hàng hóa theo ngày, tháng, cảng bến.'],
    ),
    compliance: C('Quy trình theo quy định về quản lý cảng, bến thủy nội địa', 'Kết nối cổng dịch vụ công của tỉnh', 'Lưu vết mọi thao tác xử lý hồ sơ', 'Phân quyền theo trạm, cảng vụ'),
    faqs: F(
      ['Chủ phương tiện không rành máy tính có dùng được không?', 'Có thể nộp trên điện thoại với vài bước. Cán bộ cảng vụ vẫn hỗ trợ nộp tại chỗ khi cần.'],
      ['Có kết nối với dịch vụ công trực tuyến không?', 'Có. Hồ sơ có thể tiếp nhận từ cổng dịch vụ công và trả kết quả về cổng.'],
      ['Sau khi bàn giao, ai hỗ trợ khi có sự cố?', SUPPORT],
    ),
  },

  'xu-phat-vi-pham-hanh-chinh-cang-ben': {
    kicker: 'Giao thông thủy nội địa',
    hero_title: 'Hồ sơ xử phạt rõ ràng, tra cứu trong vài giây',
    hero_text: 'Phần mềm hỗ trợ lập, theo dõi và tra cứu hồ sơ xử phạt vi phạm hành chính trong lĩnh vực cảng bến, đường thủy nội địa. Biên bản, quyết định và tình trạng thi hành được quản lý tập trung.',
    pains: L(
      ['Biên bản viết tay', 'Dễ sai sót thông tin, khó đọc, mất thời gian nhập lại để báo cáo.'],
      ['Khó theo dõi thi hành', 'Không nắm được quyết định nào đã nộp phạt, quá hạn hay cần cưỡng chế.'],
      ['Tra cứu tái phạm chậm', 'Muốn biết phương tiện đã vi phạm trước đó phải lục lại sổ sách.'],
    ),
    modules: L(
      ['Lập biên bản, quyết định', 'Tạo biên bản, quyết định theo mẫu, tự điền thông tin phương tiện và chủ sở hữu.'],
      ['Theo dõi thi hành', 'Cập nhật nộp phạt, nhắc hạn và đánh dấu hồ sơ quá hạn.'],
      ['Tra cứu vi phạm', 'Tìm theo số đăng ký, tên chủ phương tiện, thời gian và hành vi vi phạm.'],
      ['Báo cáo định kỳ', 'Tổng hợp số vụ, số tiền và hành vi vi phạm theo kỳ báo cáo.'],
    ),
    compliance: C('Mẫu biên bản, quyết định theo quy định xử phạt vi phạm hành chính', 'Lưu trữ hồ sơ điện tử đầy đủ, không sửa xóa trái phép', 'Phân quyền người lập, người duyệt', 'Kết nối dữ liệu phương tiện từ phần mềm cấp phép'),
    faqs: F(
      ['Mẫu biểu thay đổi theo quy định mới thì sao?', 'Mẫu biểu cấu hình được. Tri Thức cập nhật khi có văn bản mới thay thế.'],
      ['Có dùng chung dữ liệu với phần mềm cấp phép không?', 'Có. Thông tin phương tiện, chủ sở hữu dùng chung nên không phải nhập lại.'],
      ['Sau khi bàn giao, ai hỗ trợ khi có sự cố?', SUPPORT],
    ),
  },

  'kho-luu-tru-so-rfid': {
    kicker: 'Số hóa lưu trữ',
    hero_title: 'Biết hồ sơ nằm ở đâu, ai đang mượn, còn đủ hay không',
    hero_text: 'Giải pháp kết hợp phần mềm quản lý lưu trữ và thẻ RFID gắn trên hộp hồ sơ. Kho lưu trữ được định vị, kiểm kê nhanh, truy vết mượn trả và song song chuyển dần sang kho lưu trữ số.',
    pains: L(
      ['Tìm hồ sơ mất thời gian', 'Hồ sơ giấy nhiều, sắp xếp thủ công, mỗi lần cần phải tìm từng kệ.'],
      ['Kiểm kê kéo dài', 'Đếm và đối chiếu từng hộp mất nhiều ngày công, dễ sót.'],
      ['Không rõ ai đang giữ', 'Mượn trả ghi sổ tay, khó biết hồ sơ đang ở đâu và đã quá hạn trả chưa.'],
    ),
    modules: L(
      ['Danh mục lưu trữ', 'Quản lý phông, mục lục, hộp, hồ sơ theo nghiệp vụ lưu trữ.'],
      ['Định vị bằng RFID', 'Gắn thẻ cho hộp hồ sơ, xác định vị trí kho, giá, kệ khi tìm kiếm.'],
      ['Kiểm kê nhanh', 'Dùng đầu đọc cầm tay quét cả dãy kệ, tự đối chiếu với danh mục.'],
      ['Mượn trả và số hóa', 'Theo dõi mượn trả, cảnh báo quá hạn và gắn bản số hóa vào từng hồ sơ.'],
    ),
    compliance: C('Nghiệp vụ theo quy định về công tác văn thư, lưu trữ', 'Phân quyền khai thác theo mức độ mật', 'Lưu vết toàn bộ lịch sử mượn trả', 'Kết nối hệ thống quản lý văn bản hiện có'),
    faqs: F(
      ['Có phải thay toàn bộ kệ, hộp hiện có không?', 'Không. Thẻ RFID gắn lên hộp và kệ đang dùng, triển khai theo từng khu vực kho.'],
      ['Bản số hóa lưu ở đâu?', 'Lưu trên máy chủ của đơn vị hoặc hạ tầng do đơn vị chỉ định, có sao lưu định kỳ.'],
      ['Sau khi bàn giao, ai hỗ trợ khi có sự cố?', SUPPORT],
    ),
  },

  'nang-cap-cong-thong-tin-dien-tu': {
    kicker: 'Cổng thông tin điện tử',
    hero_title: 'Cổng thông tin nhanh, dễ tìm, cập nhật hằng ngày',
    hero_text: 'Tri Thức nâng cấp và vận hành cổng thông tin điện tử cho tỉnh, sở ngành và trường đại học: giao diện hiện đại, chạy tốt trên điện thoại, quy trình biên tập rõ ràng và an toàn khi lượng truy cập tăng cao.',
    pains: L(
      ['Giao diện cũ, khó dùng trên điện thoại', 'Người dân và doanh nghiệp truy cập chủ yếu bằng điện thoại nhưng cổng hiển thị chưa phù hợp.'],
      ['Biên tập rườm rà', 'Đăng một bài phải qua nhiều bước thủ công, khó phân quyền cho các đơn vị trực thuộc.'],
      ['Lo ngại an toàn', 'Phiên bản cũ ít được cập nhật, dễ bị khai thác lỗ hổng.'],
    ),
    modules: L(
      ['Giao diện mới', 'Thiết kế theo nhận diện của đơn vị, đáp ứng mọi kích thước màn hình.'],
      ['Biên tập và duyệt tin', 'Quy trình soạn, duyệt, đăng theo vai trò, hỗ trợ nhiều chuyên trang.'],
      ['Chuyển đổi dữ liệu cũ', 'Chuyển tin bài, văn bản, hình ảnh từ cổng cũ, giữ đường dẫn để không mất truy cập.'],
      ['Tích hợp dịch vụ', 'Kết nối dịch vụ công, văn bản chỉ đạo điều hành, hỏi đáp và thống kê truy cập.'],
    ),
    compliance: C('Đáp ứng quy định về cung cấp thông tin trên cổng thông tin điện tử của cơ quan nhà nước', 'Bảo đảm an toàn hệ thống thông tin theo cấp độ', 'Hỗ trợ người khuyết tật tiếp cận nội dung', 'Sao lưu và phục hồi định kỳ'),
    faqs: F(
      ['Nâng cấp có làm gián đoạn cổng đang chạy không?', 'Cổng mới được dựng và kiểm thử song song, chỉ chuyển sang khi đơn vị đồng ý, thường trong khung giờ ít truy cập.'],
      ['Dữ liệu cũ có giữ được không?', 'Có. Tin bài, văn bản và hình ảnh được chuyển sang cổng mới, đường dẫn cũ được chuyển hướng.'],
      ['Sau khi bàn giao, ai hỗ trợ khi có sự cố?', SUPPORT],
    ),
  },
};

const P = (...ps) => ps.map(p => p.startsWith('<') ? p : `<p>${p}</p>`).join('');

exports.projects = {
  'ban-do-so-gis-tuyen-truyen-bau-cu-can-tho': P(
    '<h2>Bài toán</h2>', 'Phục vụ công tác tuyên truyền bầu cử đại biểu Quốc hội khóa XVI và đại biểu HĐND các cấp, cử tri cần tra cứu nhanh điểm bỏ phiếu và thông tin ứng cử viên tại khu vực mình.',
    '<h2>Tri Thức đã làm</h2>', '<ul><li>Số hóa vị trí các điểm bỏ phiếu lên bản đồ số</li><li>Tra cứu theo địa chỉ hoặc vị trí hiện tại, chỉ đường đến điểm bỏ phiếu</li><li>Hiển thị thông tin ứng cử viên theo đơn vị bầu cử</li><li>Giao diện dùng tốt trên điện thoại</li></ul>'),
  'nang-cap-cong-thong-tin-dien-tu-tinh-ben-tre': P(
    '<h2>Bài toán</h2>', 'Cổng thông tin điện tử cấp tỉnh cần giao diện hiện đại, phù hợp điện thoại và quy trình biên tập thuận tiện cho nhiều đơn vị.',
    '<h2>Tri Thức đã làm</h2>', '<ul><li>Thiết kế lại giao diện theo nhận diện của tỉnh</li><li>Chuyển đổi dữ liệu tin bài, văn bản từ cổng cũ</li><li>Thiết lập quy trình soạn, duyệt, đăng tin theo vai trò</li></ul>'),
  'csdl-doanh-nghiep-tich-hop-thue-bhxh-hau-giang': P(
    '<h2>Bài toán</h2>', 'Lãnh đạo tỉnh cần nắm tình hình doanh nghiệp trên địa bàn từ nhiều nguồn dữ liệu đang nằm rời ở các ngành.',
    '<h2>Tri Thức đã làm</h2>', '<ul><li>Xây dựng cơ sở dữ liệu doanh nghiệp tập trung</li><li>Tích hợp thông tin thuế và bảo hiểm xã hội</li><li>Báo cáo, biểu đồ phục vụ lãnh đạo điều hành</li></ul>'),
  'quan-ly-giam-sat-xe-cho-rac-bac-ninh': P(
    '<h2>Bài toán</h2>', 'Cơ quan quản lý môi trường cần giám sát hành trình xe chở rác và khối lượng rác thải được thu gom, vận chuyển.',
    '<h2>Tri Thức đã làm</h2>', '<ul><li>Theo dõi hành trình xe trên bản đồ</li><li>Ghi nhận khối lượng rác theo chuyến, theo điểm tập kết</li><li>Báo cáo phục vụ quản lý và thanh toán</li></ul>'),
  'ung-dung-cntt-dieu-hanh-gtvt-ben-tre': P(
    '<h2>Bài toán</h2>', 'Ngành giao thông vận tải cần ứng dụng CNTT trong điều hành giai đoạn 2021 - 2025, trong đó có quản lý cảng, bến thủy nội địa.',
    '<h2>Tri Thức đã làm</h2>', '<ul><li>Phần mềm cấp phép ra, vào cảng, bến thủy nội địa</li><li>Kết nối dịch vụ công trực tuyến</li><li>Quản lý phương tiện và báo cáo tổng hợp</li></ul>'),
  'co-so-du-lieu-nganh-cong-thuong-ca-mau': P(
    '<h2>Bài toán</h2>', 'Ngành Công Thương cần một cơ sở dữ liệu tập trung thay cho số liệu rời rạc ở nhiều phòng, đơn vị.',
    '<h2>Tri Thức đã làm</h2>', '<ul><li>Thiết kế và xây dựng cơ sở dữ liệu ngành</li><li>Công cụ cập nhật, khai thác dữ liệu cho các phòng chuyên môn</li><li>Báo cáo thống kê phục vụ quản lý</li></ul>'),
};

const CO = 'Công ty Cổ phần Tin học Tri Thức';
const CONTACT = '<p>Liên hệ: ' + CO + ', Tầng 3, Tòa nhà An Phú Plaza, 117-119 Lý Chính Thắng, phường Xuân Hòa, TP. Hồ Chí Minh. Email trithuc@trithucsoft.vn, hotline 088 679 2809.</p>';
const NOTE = '<p><em>Bản dự thảo, cần được Tri Thức rà soát trước khi công bố chính thức.</em></p>';

exports.pages = {
  'chinh-sach-chung': NOTE + P(
    `Website trithucsoft.vn do ${CO} (mã số thuế 0304363608) sở hữu và vận hành, nhằm giới thiệu năng lực, giải pháp, dịch vụ của công ty và tiếp nhận yêu cầu tư vấn.`,
    '<h2>Thông tin trên website</h2>', 'Nội dung giới thiệu giải pháp, dự án và tin tức mang tính tham khảo. Phạm vi, giá trị và điều kiện cung cấp dịch vụ cụ thể được thống nhất trong báo giá hoặc hợp đồng giữa hai bên.',
    '<h2>Phần mềm bản quyền</h2>', 'Tri Thức cung cấp phần mềm chính hãng kèm hóa đơn. Điều kiện bảo hành, kích hoạt và đổi trả áp dụng theo chính sách của hãng sản xuất và thỏa thuận khi mua.',
    '<h2>Tiếp nhận yêu cầu</h2>', 'Yêu cầu gửi qua form liên hệ, hotline, Zalo hoặc email được phản hồi trong giờ làm việc. Mọi trao đổi chính thức được xác nhận bằng văn bản hoặc email.') + CONTACT,

  'dieu-khoan-su-dung': NOTE + P(
    'Khi truy cập website trithucsoft.vn, bạn đồng ý với các điều khoản dưới đây.',
    '<h2>Quyền sở hữu nội dung</h2>', `Văn bản, hình ảnh, logo và tài liệu trên website thuộc quyền của ${CO} hoặc đối tác đã cho phép sử dụng. Không sao chép, phát tán vì mục đích thương mại khi chưa có sự đồng ý bằng văn bản.`,
    '<h2>Sử dụng website</h2>', 'Không sử dụng website để gửi thông tin sai lệch, mã độc, thư rác hoặc thực hiện hành vi gây ảnh hưởng đến hoạt động của hệ thống.',
    '<h2>Liên kết ngoài</h2>', 'Website có thể chứa liên kết tới trang của bên thứ ba, ví dụ trang demo hoặc trang của hãng phần mềm. Tri Thức không chịu trách nhiệm về nội dung của các trang đó.',
    '<h2>Thay đổi điều khoản</h2>', 'Tri Thức có thể cập nhật điều khoản khi cần. Phiên bản mới có hiệu lực kể từ khi đăng trên website.') + CONTACT,

  'chinh-sach-bao-mat': NOTE + P(
    'Tri Thức tôn trọng và bảo vệ thông tin của người truy cập website.',
    '<h2>Thông tin thu thập</h2>', 'Khi bạn gửi form liên hệ: họ tên, đơn vị, số điện thoại, email, lĩnh vực quan tâm và nội dung yêu cầu. Hệ thống tự ghi nhận địa chỉ IP để chống thư rác.',
    '<h2>Mục đích sử dụng</h2>', 'Chỉ dùng để liên hệ tư vấn, báo giá và hỗ trợ theo yêu cầu của bạn. Tri Thức không bán hoặc cho thuê thông tin cho bên thứ ba.',
    '<h2>Bảo vệ thông tin</h2>', 'Dữ liệu lưu trên máy chủ có kiểm soát truy cập, chỉ nhân sự phụ trách được xem. Kết nối website được mã hóa HTTPS.',
    '<h2>Cookie</h2>', 'Website chỉ dùng cookie cần thiết cho hoạt động. Nếu có công cụ đo lường truy cập, thông tin được thu thập ở dạng tổng hợp, không nhằm xác định cá nhân.',
    '<h2>Quyền của bạn</h2>', 'Bạn có thể yêu cầu xem, sửa hoặc xóa thông tin đã gửi bằng cách liên hệ với chúng tôi.') + CONTACT,

  'bao-ve-du-lieu-ca-nhan': NOTE + P(
    `Chính sách này mô tả cách ${CO} xử lý dữ liệu cá nhân thu thập qua website, theo Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân.`,
    '<h2>1. Bên kiểm soát và xử lý dữ liệu</h2>', `${CO}, mã số thuế 0304363608.`,
    '<h2>2. Loại dữ liệu</h2>', 'Dữ liệu cá nhân cơ bản: họ tên, đơn vị công tác, số điện thoại, email, nội dung yêu cầu, địa chỉ IP. Tri Thức không thu thập dữ liệu cá nhân nhạy cảm qua website.',
    '<h2>3. Mục đích xử lý</h2>', 'Phản hồi yêu cầu tư vấn, gửi báo giá, hỗ trợ kỹ thuật và chống thư rác. Dữ liệu không được dùng cho mục đích khác khi chưa có sự đồng ý của bạn.',
    '<h2>4. Sự đồng ý</h2>', 'Bạn thể hiện sự đồng ý bằng cách đánh dấu ô đồng ý trước khi gửi form liên hệ. Bạn có thể rút lại sự đồng ý bất cứ lúc nào.',
    '<h2>5. Thời gian lưu trữ</h2>', 'Dữ liệu được lưu trong thời gian cần thiết để phục vụ yêu cầu và quan hệ hợp tác, sau đó được xóa hoặc ẩn danh, trừ trường hợp pháp luật yêu cầu lưu lâu hơn.',
    '<h2>6. Quyền của chủ thể dữ liệu</h2>', 'Bạn có quyền được biết, đồng ý, truy cập, yêu cầu chỉnh sửa, xóa, hạn chế xử lý, phản đối xử lý và rút lại sự đồng ý đối với dữ liệu của mình.',
    '<h2>7. Biện pháp bảo vệ</h2>', 'Kiểm soát quyền truy cập, mã hóa đường truyền, sao lưu định kỳ và ghi nhật ký truy cập hệ thống quản trị.',
    '<h2>8. Liên hệ</h2>', 'Mọi yêu cầu liên quan đến dữ liệu cá nhân, vui lòng gửi về email trithuc@trithucsoft.vn. Tri Thức phản hồi trong thời hạn pháp luật quy định.') + CONTACT,
};
