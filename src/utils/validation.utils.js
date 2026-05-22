export const validateStrongPassword = (password) => {
  if (!password) {
    return {
      valid: false,
      message: { th: "กรุณากรอกรหัสผ่าน", en: "Password is required." },
    };
  }
  if (typeof password !== "string") {
    return {
      valid: false,
      message: { th: "รหัสผ่านต้องเป็นข้อความ", en: "Password must be a string." },
    };
  }
  if (password.length < 8) {
    return {
      valid: false,
      message: { th: "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร", en: "Password must be at least 8 characters." },
    };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: { th: "รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว", en: "Password must contain at least one uppercase letter." },
    };
  }
  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: { th: "รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว", en: "Password must contain at least one number." },
    };
  }
  return { valid: true };
};
