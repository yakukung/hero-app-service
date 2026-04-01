export const RESPONSE_MESSAGES = Object.freeze({
  //================================
  // Success
  //================================
  SUCCESS: {
    message: {
      th: "สำเร็จ",
      en: "Success.",
    },
  },
  DATA_NOT_FOUND: {
    message: {
      th: "ไม่พบข้อมูล",
      en: "Data are not found.",
    },
  },
  BAD_REQUEST: {
    message: {
      th: "คำขอไม่ถูกต้อง",
      en: "Bad request.",
    },
  },
  DATA_ALREADY_EXIST: {
    message: {
      th: "ข้อมูลนี้มีอยู่แล้ว",
      en: "Data already exist.",
    },
  },
  SHEET_ALREADY_PURCHASED: {
    message: {
      th: "ไม่สามารถลบชีตนี้ได้ เนื่องจากมีผู้ซื้อแล้ว",
      en: "This sheet cannot be deleted because it has already been purchased.",
    },
  },

  //================================
  // Invalid Error
  //================================
  INVALID_PASSWORD: {
    message: {
      th: "รหัสผ่านไม่ถูกต้อง",
      en: "Invalid password.",
    },
  },
  INVALID_OLD_PASSWORD: {
    message: {
      th: "รหัสผ่านเดิมไม่ถูกต้อง",
      en: "Invalid old password.",
    },
  },
  TOKEN_INVALID_INVALID_ERROR: {
    message: {
      th: "token ไม่ถูกต้อง",
      en: "token is invalid.",
    },
  },
  TOKEN_EXPIRED_INVALID_ERROR: {
    message: {
      th: "token หมดอายุ",
      en: "token is expired.",
    },
  },
  TOKEN_SYNTAX_ERROR_INTERNAL_ERROR: {
    message: {
      th: "token ไม่ถูกต้อง",
      en: "token is invalid.",
    },
  },
  RESET_LINK_USED_ERROR: {
    message: {
      th: "ลิงก์รีเซ็ตรหัสผ่านนี้ถูกใช้งานแล้ว",
      en: "Reset link has already been used.",
    },
  },
  OLD_PASSWORD_INVALID_ERROR: {
    message: {
      th: "รหัสผ่านเดิมไม่ถูกต้อง",
      en: "old password is invalid.",
    },
  },
  PASSWORD_INVALID_ERROR: {
    message: {
      th: "รหัสผ่านไม่ถูกต้อง",
      en: "password is invalid.",
    },
  },

  AUTHENTICATION_INVALID_ERROR: {
    message: {
      th: "ชื่อผู้ใช้ อีเมล หรือรหัสผ่านไม่ถูกต้อง",
      en: "Incorrect username, email, or password.",
    },
  },

  PASSWORD_NOT_MATCH_ERROR: {
    message: {
      th: "รหัสผ่านไม่ตรงกัน",
      en: "Password not match.",
    },
  },

  //================================
  // User Account Error
  //================================
  USER_ACCOUNT_TERMINATED_ERROR: {
    message: {
      th: "บัญชีนี้ถูกยกเลิกการใช้งานถาวร",
      en: "This account has been permanently terminated.",
    },
  },
  USER_ACCOUNT_SUSPENDED_ERROR: {
    message: {
      th: "บัญชีนี้ถูกระงับการใช้งานชั่วคราว",
      en: "This account has been suspended.",
    },
  },
  USER_ACCOUNT_PENDING_ERROR: {
    message: {
      th: "บัญชีนี้อยู่ระหว่างรอการยืนยัน กรุณาตรวจสอบอีเมลของคุณ",
      en: "This account is pending. Please verify your account via the email sent to you.",
    },
  },

  //================================
  // Already Error
  //================================
  EMAIL_ALREADY_ERROR: {
    message: {
      th: "อีเมลนี้ถูกใช้งานแล้ว",
      en: "Email is already.",
    },
  },
  USERNAME_ALREADY_ERROR: {
    message: {
      th: "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว",
      en: "Username is already.",
    },
  },

  //================================
  // Pattern Error
  //================================
  EMAIL_PATTERN_ERROR: {
    message: {
      th: "รูปแบบอีเมลไม่ถูกต้อง",
      en: "Email pattern error.",
    },
  },
  USERNAME_PATTERN_ERROR: {
    message: {
      th: "รูปแบบชื่อผู้ใช้ไม่ถูกต้อง",
      en: "Username pattern error.",
    },
  },
  PASSWORD_PATTERN_ERROR: {
    message: {
      th: "รูปแบบรหัสผ่านไม่ถูกต้อง",
      en: "Password pattern error.",
    },
  },

  //================================
  // Server Error
  //================================
  INTERNAL_SERVER_ERROR: {
    message: {
      th: "เกิดข้อผิดพลาดภายในระบบ",
      en: "Internal server error.",
    },
  },
});
