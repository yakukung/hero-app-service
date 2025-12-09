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
  FAILED: {
    message: {
      th: "คำขอไม่ถูกต้อง",
      en: "Bad request.",
    },
  },

  //================================
  // Invalid Error
  //================================
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
      th: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
      en: "This email or password is an incorrect.",
    },
  },
  USER_NOT_ACTIVE_ERROR: {
    message: {
      th: "บัญชีนี้ไม่สามารถใช้งานได้",
      en: "This account cannot be used.",
    },
  },
  PASSWORD_NOT_MATCH_ERROR: {
    message: {
      th: "รหัสผ่านไม่ตรงกัน",
      en: "Password not match.",
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
