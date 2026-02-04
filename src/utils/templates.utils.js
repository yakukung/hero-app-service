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
