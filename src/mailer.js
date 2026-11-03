// Gửi email báo yêu cầu tư vấn mới (tùy chọn). Cần SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM.
const nodemailer = require('nodemailer');
let tx = null;
function transport() {
  if (!process.env.SMTP_HOST) return null;
  if (!tx) tx = nodemailer.createTransport({
    host: process.env.SMTP_HOST, port: +(process.env.SMTP_PORT || 587), secure: process.env.SMTP_PORT === '465',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  return tx;
}
async function notifyLead(to, lead, base) {
  const t = transport();
  if (!t || !to) return;
  const lines = [`Mã: ${lead.code}`, `Họ tên: ${lead.name}`, `Đơn vị: ${lead.org}`, `Điện thoại: ${lead.phone}`, `Email: ${lead.email}`,
    `Lĩnh vực: ${lead.need}`, '', lead.msg, '', `Xem trong quản trị: ${base}/quan-tri/yeu-cau`];
  await t.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject: `[Website] Yêu cầu tư vấn mới ${lead.code} - ${lead.name}`, text: lines.join('\n') });
}
module.exports = { notifyLead };
