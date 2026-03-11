export const getVerificationSuccessTemplate = (redirectUrl = "/") => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ยืนยันอีเมลสำเร็จ</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f0f2f5;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }
    .container {
      background-color: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      text-align: center;
      max-width: 400px;
      width: 90%;
    }
    .icon-circle {
      width: 80px;
      height: 80px;
      background-color: #e8f5e9;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
    }
    .checkmark {
      color: #4CAF50;
      font-size: 40px;
    }
    h1 {
      color: #333;
      margin-bottom: 10px;
      font-size: 24px;
    }
    p {
      color: #666;
      margin-bottom: 30px;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon-circle">
      <span class="checkmark">✓</span>
    </div>
    <h1>ยืนยันบัญชีเรียบร้อย</h1>
    <p>บัญชีของคุณได้รับการยืนยันเรียบร้อยแล้ว คุณสามารถเข้าสู่ระบบได้ทันที</p>
  </div>
</body>
</html>
`;

export const getVerificationErrorTemplate = (message) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ยืนยันอีเมลไม่สำเร็จ</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f0f2f5;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }
    .container {
      background-color: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      text-align: center;
      max-width: 400px;
      width: 90%;
    }
    .icon-circle {
      width: 80px;
      height: 80px;
      background-color: #ffebee;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
    }
    .cross {
      color: #f44336;
      font-size: 40px;
    }
    h1 {
      color: #333;
      margin-bottom: 10px;
      font-size: 24px;
    }
    p {
      color: #666;
      margin-bottom: 30px;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon-circle">
      <span class="cross">✕</span>
    </div>
    <h1>การยืนยันล้มเหลว</h1>
    <p>${message || "เกิดข้อผิดพลาด โปรดลองใหม่อีกครั้งหรือติดต่อฝ่ายสนับสนุน"}</p>
  </div>
</body>
</html>
`;

export const getResetPasswordTemplate = (token = "") => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>รีเซ็ตรหัสผ่าน</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f0f2f5;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }
    .container {
      background-color: white;
      padding: 32px;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-width: 420px;
      width: 92%;
    }
    h1 {
      font-size: 22px;
      margin: 0 0 16px 0;
      color: #333;
    }
    label {
      display: block;
      margin: 12px 0 6px 0;
      font-weight: 600;
      color: #333;
    }
    input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
    }
    button {
      margin-top: 16px;
      width: 100%;
      padding: 12px;
      border: none;
      border-radius: 8px;
      background: #2A5DB9;
      color: white;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
    }
    .message {
      margin-top: 12px;
      font-size: 13px;
    }
    .error {
      color: #c62828;
    }
    .success {
      color: #2e7d32;
    }
  </style>
</head>
<body>
  <div class="container" id="container">
    <h1>รีเซ็ตรหัสผ่าน</h1>
    <form id="reset-form">
      <label for="password">รหัสผ่านใหม่</label>
      <input id="password" type="password" placeholder="กรอกรหัสผ่านใหม่" required />
      <label for="confirm">ยืนยันรหัสผ่านใหม่</label>
      <input id="confirm" type="password" placeholder="ยืนยันรหัสผ่านใหม่" required />
      <button type="submit">ยืนยันการรีเซ็ต</button>
      <div id="message" class="message"></div>
    </form>
  </div>
  <script>
    const token = ${JSON.stringify(token || "")};
    const form = document.getElementById("reset-form");
    const container = document.getElementById("container");
    const msgEl = document.getElementById("message");

    const setMessage = (text, type) => {
      msgEl.textContent = text;
      msgEl.className = "message " + (type || "");
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!token) {
        setMessage("ลิงก์ไม่ถูกต้องหรือหมดอายุ", "error");
        return;
      }
      const password = document.getElementById("password").value;
      const confirm = document.getElementById("confirm").value;
      if (!password || !confirm) {
        setMessage("กรุณากรอกข้อมูลให้ครบถ้วน", "error");
        return;
      }
      if (password !== confirm) {
        setMessage("รหัสผ่านไม่ตรงกัน", "error");
        return;
      }
      try {
        const res = await fetch("/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            new_password: password,
            confirmPassword: confirm,
          }),
        });
        if (res.status === 204) {
          container.innerHTML = \`
            <h1>รีเซ็ตรหัสผ่านสำเร็จ</h1>
            <p class="message success">คุณสามารถกลับไปเข้าสู่ระบบได้ทันที</p>
          \`;
          return;
        }
        let data = null;
        try { data = await res.json(); } catch (_) {}
        const errorText =
          data?.error?.message?.th ||
          data?.error?.message?.en ||
          "เกิดข้อผิดพลาด โปรดลองใหม่อีกครั้ง";
        setMessage(errorText, "error");
      } catch (err) {
        setMessage("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้", "error");
      }
    });
  </script>
</body>
</html>
`;
