// src/utils/email.js
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || "no-reply@example.com";

export async function sendVerificationEmail(to, otp) {
  try {
    const resp = await resend.emails.send({
      from: FROM,
      to,
      subject: "Xác nhận SE2025",
      text: `OTP: ${otp}`,
    });
    console.log("Resend response:", resp); // <-- bắt buộc log
    return resp;
  } catch (err) {
    console.error("Resend send error:", err); // <-- log lỗi chi tiết
    throw err;
  }
}
