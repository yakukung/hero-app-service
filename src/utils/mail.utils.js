import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendVerificationEmail = async (email, userId, base_url) => {
  try {
    const baseUrl = base_url || process.env.BASE_URL;
    const verifyLink = `${baseUrl}/auth/verify/${userId}`;

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Hero App" <no-reply@heroapp.com>',
      to: email,
      subject: "ยืนยันตัวตนของคุณ",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>ยินดีต้อนรับสู่ Hero App!</h2>
          <p>โปรดคลิกปุ่มด้านล่างเพื่อยืนยันตัวตนของคุณ:</p>
          
          <a href="${verifyLink}" style="background-color: #4CAF50; color: white; padding: 14px 20px; margin: 8px 0; text-decoration: none; display: inline-block; border-radius: 4px; font-size: 16px;">
            ยืนยันตัวตน
          </a>
          
          <p style="font-size: 12px; color: #888; margin-top: 20px;">
             หากปุ่มไม่ทำงาน โปรดคัดลอกและวางลิงก์นี้ลงในเบราว์เซอร์ของคุณ:<br>
             ${verifyLink}
          </p>
        </div>
      `,
    });

    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export const sendResetPasswordEmail = async (email, resetLink) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Hero App" <no-reply@heroapp.com>',
      to: email,
      subject: "รีเซ็ตรหัสผ่านของคุณ",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>รีเซ็ตรหัสผ่าน</h2>
          <p>โปรดคลิกปุ่มด้านล่างเพื่อรีเซ็ตรหัสผ่านของคุณ:</p>
          
          <a href="${resetLink}" style="background-color: #2A5DB9; color: white; padding: 14px 20px; margin: 8px 0; text-decoration: none; display: inline-block; border-radius: 4px; font-size: 16px;">
            รีเซ็ตรหัสผ่าน
          </a>
          
          <p style="font-size: 12px; color: #888; margin-top: 20px;">
             หากปุ่มไม่ทำงาน โปรดคัดลอกและวางลิงก์นี้ลงในเบราว์เซอร์ของคุณ:<br>
             ${resetLink}
          </p>
        </div>
      `,
    });

    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
