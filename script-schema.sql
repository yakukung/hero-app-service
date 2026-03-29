SET FOREIGN_KEY_CHECKS = 0;
DROP FUNCTION IF EXISTS `UUIDV7`;

DROP TABLE IF EXISTS `buy_sheets`;
DROP TABLE IF EXISTS `buy_plans`;
DROP TABLE IF EXISTS `report_users`;
DROP TABLE IF EXISTS `report_sheets`;
DROP TABLE IF EXISTS `report_posts`;
DROP TABLE IF EXISTS `users_follows`;
DROP TABLE IF EXISTS `wallet_topups`;
DROP TABLE IF EXISTS `users_plans`;
DROP TABLE IF EXISTS `plans`;
DROP TABLE IF EXISTS `posts_shares`;
DROP TABLE IF EXISTS `posts_comments`;
DROP TABLE IF EXISTS `posts_likes`;
DROP TABLE IF EXISTS `posts`;
DROP TABLE IF EXISTS `users_sheets_favorites`;
DROP TABLE IF EXISTS `users_sheets_answers`;
DROP TABLE IF EXISTS `sheets_answers`;
DROP TABLE IF EXISTS `sheets_questions`;
DROP TABLE IF EXISTS `sheets_files`;
DROP TABLE IF EXISTS `sheets_reviews`;
DROP TABLE IF EXISTS `sheets`;
DROP TABLE IF EXISTS `keywords`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `tokens`;
DROP TABLE IF EXISTS `sessions`;
DROP TABLE IF EXISTS `user_providers`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `scopes`;
DROP TABLE IF EXISTS `permissions`;
DROP TABLE IF EXISTS `roles`;

DROP TRIGGER IF EXISTS `before_insert_roles`;
DROP TRIGGER IF EXISTS `before_insert_permissions`;
DROP TRIGGER IF EXISTS `before_insert_scopes`;
DROP TRIGGER IF EXISTS `before_insert_users`;
DROP TRIGGER IF EXISTS `before_insert_user_providers`;
DROP TRIGGER IF EXISTS `before_insert_sessions`;
DROP TRIGGER IF EXISTS `before_insert_tokens`;
DROP TRIGGER IF EXISTS `before_insert_sheets`;
DROP TRIGGER IF EXISTS `before_insert_categories`;
DROP TRIGGER IF EXISTS `before_insert_keywords`;
DROP TRIGGER IF EXISTS `before_insert_sheets_files`;
DROP TRIGGER IF EXISTS `before_insert_sheets_questions`;
DROP TRIGGER IF EXISTS `before_insert_sheets_answers`;
DROP TRIGGER IF EXISTS `before_insert_users_sheets_answers`;
DROP TRIGGER IF EXISTS `before_insert_users_sheets_favorites`;
DROP TRIGGER IF EXISTS `before_insert_sheets_reviews`;
DROP TRIGGER IF EXISTS `before_insert_posts`;
DROP TRIGGER IF EXISTS `before_insert_posts_likes`;
DROP TRIGGER IF EXISTS `before_insert_posts_comments`;
DROP TRIGGER IF EXISTS `before_insert_posts_shares`;
DROP TRIGGER IF EXISTS `before_insert_users_follows`;
DROP TRIGGER IF EXISTS `before_insert_report_posts`;
DROP TRIGGER IF EXISTS `before_insert_report_sheets`;
DROP TRIGGER IF EXISTS `before_insert_report_users`;
DROP TRIGGER IF EXISTS `before_insert_plans`;
DROP TRIGGER IF EXISTS `before_insert_users_plans`;
DROP TRIGGER IF EXISTS `before_insert_buy_plans`;
DROP TRIGGER IF EXISTS `before_insert_buy_sheets`;
DROP TRIGGER IF EXISTS `before_insert_wallet_topups`;

DELIMITER $$
CREATE FUNCTION UUIDV7()
RETURNS CHAR(36)
DETERMINISTIC
NO SQL
SQL SECURITY INVOKER
BEGIN
    DECLARE unix_ms BIGINT;
    DECLARE time_hex CHAR(12);
    DECLARE rand_hex CHAR(20);
    DECLARE version_hex CHAR(4);
    DECLARE variant_hex CHAR(4);
    DECLARE node_hex CHAR(12);
    DECLARE variant_byte_hex CHAR(2);

    SET unix_ms = FLOOR(UNIX_TIMESTAMP(NOW(3)) * 1000);
    SET time_hex = LPAD(HEX(unix_ms), 12, '0');
    SET rand_hex = HEX(RANDOM_BYTES(10));
    SET version_hex = CONCAT('7', SUBSTR(rand_hex, 1, 3));
    SET variant_byte_hex = LPAD(HEX((CONV(SUBSTR(rand_hex, 4, 2), 16, 10) & 0x3F) | 0x80), 2, '0');
    SET variant_hex = CONCAT(variant_byte_hex, SUBSTR(rand_hex, 6, 2));

    SET node_hex = SUBSTR(rand_hex, 8, 12);
    RETURN LOWER(CONCAT(
        SUBSTR(time_hex, 1, 8), '-',
        SUBSTR(time_hex, 9, 4), '-',
        version_hex, '-',
        variant_hex, '-',
        node_hex
    ));
END$$

DELIMITER ;

-- ====================
-- Authentication
-- ====================
CREATE TABLE `roles` (
  `id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id กลุ่มผู้ใช้งาน',
  `name` VARCHAR(30) DEFAULT NULL COMMENT 'เก็บชื่อกลุ่มผู้ใช้งาน',
  `visible_flag` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'เก็บสถานะการมองเห็นข้อมูล',
  `status_flag` ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'เก็บวันที่สร้างข้อมูล',
  `created_by` VARCHAR(255) NOT NULL DEFAULT 'SYSTEM' COMMENT 'เก็บ id ผู้สร้างข้อมูล',
  `updated_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขล่าสุด',
  `updated_by` VARCHAR(255) NULL COMMENT 'เก็บ id ผู้แก้ไขข้อมูลล่าสุด',
  `status_modified_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขสถานะล่าสุด',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บข้อมูลกลุ่มผู้ใช้งาน';

CREATE TABLE `permissions` (
  `id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id สิทธิ์การใช้งาน',
  `name` VARCHAR(30) DEFAULT NULL COMMENT 'เก็บชื่อสิทธิ์การใช้งาน',
  `visible_flag` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'เก็บสถานะการมองเห็นข้อมูล',
  `status_flag` ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'เก็บวันที่สร้างข้อมูล',
  `created_by` VARCHAR(255) NOT NULL DEFAULT 'SYSTEM' COMMENT 'เก็บ id ผู้สร้างข้อมูล',
  `updated_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขล่าสุด',
  `updated_by` VARCHAR(255) NULL COMMENT 'เก็บ id ผู้แก้ไขข้อมูลล่าสุด',
  `status_modified_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขสถานะล่าสุด',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บข้อมูลสิทธิ์การใช้งาน';

CREATE TABLE `scopes` (
  `id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id เชื่อมโยงสิทธิ์และกลุ่มผู้ใช้งาน',
  `role_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id กลุ่มผู้ใช้งานที่อ้างถึง',
  `permission_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id สิทธิ์การใช้งานที่อ้างถึง',
  `visible_flag` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'เก็บสถานะการมองเห็นข้อมูล',
  `status_flag` ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'เก็บวันที่สร้างข้อมูล',
  `created_by` VARCHAR(255) NOT NULL DEFAULT 'SYSTEM' COMMENT 'เก็บ id ผู้สร้างข้อมูล',
  `updated_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขล่าสุด',
  `updated_by` VARCHAR(255) NULL COMMENT 'เก็บ id ผู้แก้ไขข้อมูลล่าสุด',
  `status_modified_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขสถานะล่าสุด',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_role_permission` (`role_id`, `permission_id`),
  CONSTRAINT `fk_scopes_role_id` 
    FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `fk_scopes_permission_id` 
    FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บเชื่อมโยงสิทธิ์และกลุ่มผู้ใช้งาน';

CREATE TABLE `users` (
  `id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id ผู้ใช้',
  `username` VARCHAR(30) DEFAULT NULL COMMENT 'เก็บชื่อผู้ใช้',
  `email` VARCHAR(255) NULL COMMENT 'เก็บอีเมลของผู้ใช้',
  `password` BINARY(60) NULL COMMENT 'เก็บรหัสผ่านที่เข้ารหัสของผู้ใช้',
  `profile_image` TEXT DEFAULT NULL COMMENT 'เก็บ URL รูปโปรไฟล์',
  `auth_provider` ENUM('EMAIL_PASSWORD','GOOGLE') NOT NULL DEFAULT 'EMAIL_PASSWORD' COMMENT 'เก็บวิธีช่องทางที่ผู้ใช้สมัครบัญชี',
  `visible_flag` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'เก็บสถานะการมองเห็นข้อมูล',
  `status_flag` ENUM('PENDING','ACTIVE','INACTIVE','SUSPENDED','TERMINATED') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'เก็บวันที่สร้างข้อมูล',
  `created_by` VARCHAR(255) NOT NULL DEFAULT 'SYSTEM' COMMENT 'เก็บ id ผู้สร้างข้อมูล',
  `updated_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขล่าสุด',
  `updated_by` VARCHAR(255) NULL COMMENT 'เก็บ id ผู้แก้ไขข้อมูลล่าสุด',
  `status_modified_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขสถานะล่าสุด',
  `role_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id กลุ่มผู้ใช้งานที่อ้างถึง',
  `point` INTEGER DEFAULT 0 NOT NULL COMMENT 'เก็บคะแนนของผู้ใช้',
  `keyword` json NULL COMMENT 'เก็บ keyword ของผู้ใข้',
  `total_wallet` DECIMAL(10,2) DEFAULT 0.00 COMMENT 'เก็บยอดเงินในวอลเล็ตของผู้ใช้',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_email` (`email`),
  KEY `idx_users_username` (`username`),
  KEY `idx_users_role_id` (`role_id`),
  KEY `idx_users_status_flag` (`status_flag`),
  CONSTRAINT `fk_users_role_id`
    FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บข้อมูลผู้ใช้';

CREATE TABLE `user_providers` (
  `id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id บัญชีผู้ใช้ภายนอก',
  `user_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id ผู้ใช้ที่อ้างถึงในตาราง users',
  `provider_user_id` VARCHAR(255) NOT NULL COMMENT 'เก็บ id ผู้ใช้จากระบบของผู้ใช้ภายนอก',
  `provider_name` ENUM('GOOGLE') NOT NULL COMMENT 'เก็บชื่อของผู้ให้บริการภายนอก',
  `provider_username` VARCHAR(255) NOT NULL COMMENT 'เก็บชื่อผู้ใช้จากระบบของผู้ให้บริการภายนอก',
  `provider_email` VARCHAR(255) NOT NULL COMMENT 'เก็บอีเมลจากระบบของผู้ให้บริการภายนอก',
  `visible_flag` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'เก็บสถานะการมองเห็นข้อมูล',
  `status_flag` ENUM('PENDING','ACTIVE','INACTIVE','SUSPENDED','TERMINATED') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'เก็บวันที่สร้างข้อมูล',
  `created_by` VARCHAR(255) NOT NULL DEFAULT 'SYSTEM' COMMENT 'เก็บผู้สร้างข้อมูล',
  `updated_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขล่าสุด',
  `updated_by` VARCHAR(255) NULL COMMENT 'เก็บ id ผู้แก้ไขข้อมูลล่าสุด',
  `status_modified_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขสถานะล่าสุด',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_provider_user_id` (`provider_user_id`),
  UNIQUE KEY `unique_user_provider` (`user_id`, `provider_name`),
  CONSTRAINT `fk_user_providers_user_id`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บข้อมูลบัญชีผู้ใช้ที่เชื่อมกับผู้ให้บริการภายนอก';

CREATE TABLE `sessions` (
  `id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id refresh token',
  `user_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id ที่อ้างถึงในตาราง users',
  `refresh_token` VARCHAR(512) NOT NULL COMMENT 'เก็บ refresh token',
  `issued_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'เก็บเวลาที่ออก refresh token',
  `expires_at` TIMESTAMP(3) NOT NULL COMMENT 'เก็บเวลาหมดอายุของ refresh token',
  `revoked_flag` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'สถานะเพิกถอน refresh token',
  `ip_address` VARCHAR(45) DEFAULT NULL COMMENT 'เก็บที่อยู่ IP ของผู้ใช้ขณะออก refresh token',
  `user_agent` VARCHAR(500) DEFAULT NULL COMMENT 'เก็บข้อมูล User Agent ของอุปกรณ์หรือเบราว์เซอร์',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_refresh_token` (`refresh_token`),
  KEY `idx_sessions_user_id` (`user_id`),
  CONSTRAINT `fk_sessions_user_id`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บข้อมูล Refresh Token ของผู้ใช้';

CREATE TABLE `tokens` (
  `id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id access token',
  `session_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id session ที่อ้างถึงในตาราง sessions',
  `access_token` VARCHAR(512) NOT NULL COMMENT 'เก็บ access token',
  `issued_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'เก็บเวลาที่ออก access token',
  `expires_at` TIMESTAMP(3) NOT NULL COMMENT 'เก็บเวลาหมดอายุของ access token',
  `revoked_flag` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'สถานะเพิกถอน access token',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_access_token` (`access_token`),
  KEY `idx_tokens_session_id` (`session_id`),
  CONSTRAINT `fk_tokens_session_id`
    FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บข้อมูล Access Token ของผู้ใช้';

-- ====================
-- Sheets
-- ====================
CREATE TABLE `sheets` (
  `id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id เอกสารสรุปเนื้อหา',
  `author_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id ผู้ใช้ที่อ้างถึงในตาราง users',
  `title` VARCHAR(255) NOT NULL COMMENT 'เก็บชื่อเอกสารสรุป',
  `description` TEXT DEFAULT NULL COMMENT 'เก็บคำอธิบายเพิ่มเติมของเอกสาร',
  `rating` DECIMAL(3,1) DEFAULT NULL COMMENT 'เก็บคะแนนความพึงพอใจ',
  `price` DECIMAL(10,2) DEFAULT NULL COMMENT 'เก็บราคาเอกสาร',
  `visible_flag` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'เก็บสถานะการมองเห็นข้อมูล',
  `status_flag` ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'เก็บวันที่สร้างข้อมูล',
  `created_by` VARCHAR(255) NOT NULL DEFAULT 'SYSTEM' COMMENT 'เก็บผู้สร้างข้อมูล',
  `updated_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขล่าสุด',
  `updated_by` VARCHAR(255) NULL COMMENT 'เก็บ id ผู้แก้ไขข้อมูลล่าสุด',
  `status_modified_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขสถานะล่าสุด',
  PRIMARY KEY (`id`),
  KEY `idx_sheets_author_id` (`author_id`),
  KEY `idx_sheets_status_flag` (`status_flag`),
  KEY `idx_sheets_rating` (`rating`),
  KEY `idx_sheets_price` (`price`),
  CONSTRAINT `fk_sheets_author_id`
    FOREIGN KEY (`author_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บข้อมูลเอกสารสรุปเนื้อหา';

CREATE TABLE `categories` (
  `id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id การเชื่อมโยงเอกสารกับหมวดหมู่',
  `sheet_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id เอกสารสรุปที่อ้างถึงในตาราง sheets',
  `name` ENUM('วิทยาศาสตร์','คณิตศาสตร์','คอมพิวเตอร์','วิศวกรรมศาสตร์','ภาษาไทย','ภาษาอังกฤษ','ภาษาอื่นๆ','สังคมศึกษา','บริหารธุรกิจ','สุขภาพ','กฎหมาย','ศิลปะ','อื่นๆ') NOT NULL COMMENT 'เก็บชื่อหมวดหมู่',
  `visible_flag` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'เก็บสถานะการมองเห็นข้อมูล',
  `status_flag` ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'เก็บวันที่สร้างข้อมูล',
  `created_by` VARCHAR(255) NOT NULL DEFAULT 'SYSTEM' COMMENT 'เก็บผู้สร้างข้อมูล',
  `updated_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขล่าสุด',
  `updated_by` VARCHAR(255) NULL COMMENT 'เก็บ id ผู้แก้ไขข้อมูลล่าสุด',
  `status_modified_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขสถานะล่าสุด',
  PRIMARY KEY (`id`),
  KEY `idx_categories_sheet_id` (`sheet_id`),
  KEY `idx_categories_name` (`name`),
  CONSTRAINT `fk_categories_sheet_id`
    FOREIGN KEY (`sheet_id`) REFERENCES `sheets` (`id`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเชื่อมโยงเอกสารสรุปเนื้อหากับหมวดหมู่';

CREATE TABLE `keywords` (
  `id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id การเชื่อมโยงเอกสารกับคำค้นหา',
  `sheet_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id เอกสารสรุปที่อ้างถึงในตาราง sheets',
  `name` VARCHAR(255) NOT NULL COMMENT 'เก็บชื่อคำค้นหา',
  `visible_flag` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'เก็บสถานะการมองเห็นข้อมูล',
  `status_flag` ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'เก็บวันที่สร้างข้อมูล',
  `created_by` VARCHAR(255) NOT NULL DEFAULT 'SYSTEM' COMMENT 'เก็บผู้สร้างข้อมูล',
  `updated_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขล่าสุด',
  `updated_by` VARCHAR(255) NULL COMMENT 'เก็บ id ผู้แก้ไขข้อมูลล่าสุด',
  `status_modified_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขสถานะล่าสุด',
  PRIMARY KEY (`id`),
  KEY `idx_keywords_sheet_id` (`sheet_id`),
  KEY `idx_keywords_name` (`name`),
  CONSTRAINT `fk_keywords_sheet_id`
    FOREIGN KEY (`sheet_id`) REFERENCES `sheets` (`id`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเชื่อมโยงเอกสารสรุปเนื้อหากับคำค้นหา';

CREATE TABLE `sheets_files` (
  `id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id ไฟล์เอกสาร',
  `sheet_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id เอกสารสรุปที่อ้างถึงในตาราง sheets',
  `format` VARCHAR(255) NOT NULL COMMENT 'เก็บนามสกุลไฟล์เอกสาร',
  `size` VARCHAR(255) NOT NULL COMMENT 'เก็บขนาดไฟล์เอกสาร',
  `original_path` VARCHAR(255) NOT NULL COMMENT 'เก็บ path ไฟล์ original เอกสาร',
  `thumbnail_path` VARCHAR(255) NOT NULL COMMENT 'เก็บ path ไฟล์ thumbnail เอกสาร',
  `index` INT NOT NULL DEFAULT 1 COMMENT 'เก็บลำดับไฟล์เอกสาร',
  `checksum` VARCHAR(255) NOT NULL COMMENT 'เก็บค่า checksum ไฟล์เอกสาร',
  `visible_flag` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'เก็บสถานะการมองเห็นข้อมูล',
  `status_flag` ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'เก็บวันที่สร้างข้อมูล',
  `created_by` VARCHAR(255) NOT NULL DEFAULT 'SYSTEM' COMMENT 'เก็บผู้สร้างข้อมูล',
  `updated_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขล่าสุด',
  `updated_by` VARCHAR(255) NULL COMMENT 'เก็บ id ผู้แก้ไขข้อมูลล่าสุด',
  `status_modified_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขสถานะล่าสุด',
  PRIMARY KEY (`id`),
  KEY `idx_sheets_files_sheet_id` (`sheet_id`),
  CONSTRAINT `fk_sheets_files_sheet_id`
    FOREIGN KEY (`sheet_id`) REFERENCES `sheets` (`id`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บข้อมูลไฟล์เอกสารสรุปเนื้อหา';


CREATE TABLE `sheets_questions` (
  `id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id คำถามท้ายบท',
  `sheet_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id เอกสารสรุปที่อ้างถึงในตาราง sheets',
  `question_text` TEXT NOT NULL COMMENT 'เก็บข้อความคำถาม',
  `explanation` TEXT DEFAULT NULL COMMENT 'เก็บคำอธิบายเพิ่มเติมของคำตอบหรือเฉลย',
  `index` INT NOT NULL DEFAULT 1 COMMENT 'เก็บลำดับของคำถามในเอกสาร',
  `visible_flag` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'เก็บสถานะการมองเห็นข้อมูล',
  `status_flag` ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'เก็บวันที่สร้างข้อมูล',
  `created_by` VARCHAR(255) NOT NULL DEFAULT 'SYSTEM' COMMENT 'เก็บผู้สร้างข้อมูล',
  `updated_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขล่าสุด',
  `updated_by` VARCHAR(255) NULL COMMENT 'เก็บ id ผู้แก้ไขข้อมูลล่าสุด',
  `status_modified_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขสถานะล่าสุด',
  PRIMARY KEY (`id`),
  KEY `idx_sheets_questions_sheet_id` (`sheet_id`),
  CONSTRAINT `fk_sheets_questions_sheet_id`
    FOREIGN KEY (`sheet_id`) REFERENCES `sheets` (`id`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บข้อมูลคำถามท้ายบทของเอกสารสรุป';

CREATE TABLE `sheets_answers` (
  `id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id คำตอบของคำถาม',
  `question_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id คำถามที่อ้างถึงในตาราง sheets_questions',
  `answer_text` TEXT NOT NULL COMMENT 'เก็บข้อความคำตอบ',
  `is_correct` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'ระบุว่าคำตอบนี้ถูกต้องหรือไม่',
  `index` INT NOT NULL DEFAULT 1 COMMENT 'เก็บลำดับของคำตอบในคำถามเดียวกัน',
  `visible_flag` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'เก็บสถานะการมองเห็นข้อมูล',
  `status_flag` ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
  `created_by` VARCHAR(255) NOT NULL DEFAULT 'SYSTEM' COMMENT 'เก็บผู้สร้างข้อมูล',
  `updated_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขล่าสุด',
  `updated_by` VARCHAR(255) NULL COMMENT 'เก็บ id ผู้แก้ไขข้อมูลล่าสุด',
  `status_modified_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขสถานะล่าสุด',
  PRIMARY KEY (`id`),
  KEY `idx_sheets_answers_question_id` (`question_id`),
  CONSTRAINT `fk_sheets_answers_question_id`
    FOREIGN KEY (`question_id`) REFERENCES `sheets_questions` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='ตารางเก็บข้อมูลคำตอบของคำถามท้ายบท';

CREATE TABLE `users_sheets_answers` (
  `id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id ของการตอบคำถามครั้งนี้',
  `user_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id ผู้ใช้ที่ตอบ (อ้างถึง users.id)',
  `question_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id คำถามที่ตอบ (อ้างถึง sheets_questions.id)',
  `selected_answer_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id คำตอบที่ผู้ใช้เลือก (อ้างถึง sheet_answers.id)',
  `is_correct` BOOLEAN DEFAULT NULL COMMENT 'เก็บผลลัพธ์ว่าคำตอบที่เลือกถูกหรือไม่ (เก็บขณะที่ตอบ)',
  `visible_flag` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'เก็บสถานะการมองเห็นข้อมูล',
  `status_flag` ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'เก็บวันที่สร้างข้อมูล',
  `created_by` VARCHAR(255) NOT NULL DEFAULT 'SYSTEM' COMMENT 'เก็บผู้สร้างข้อมูล',
  `updated_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขล่าสุด',
  `updated_by` VARCHAR(255) NULL COMMENT 'เก็บ id ผู้แก้ไขข้อมูลล่าสุด',
  `status_modified_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขสถานะล่าสุด',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_question_answer` (`user_id`, `question_id`),
  KEY `idx_users_sheets_answers_question_id` (`question_id`),
  KEY `idx_users_sheets_answers_selected_answer_id` (`selected_answer_id`),
  CONSTRAINT `fk_users_sheets_answers_user_id`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_users_sheets_answers_question_id`
    FOREIGN KEY (`question_id`) REFERENCES `sheets_questions` (`id`),
  CONSTRAINT `fk_users_sheets_answers_selected_answer_id`
    FOREIGN KEY (`selected_answer_id`) REFERENCES `sheets_answers` (`id`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บข้อมูลว่าผู้ใช้ตอบคำถามข้อไหนและเลือกคำตอบใด';


CREATE TABLE `users_sheets_favorites` (
  `id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id รายการโปรด',
  `sheet_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id เอกสารสรุปที่อ้างถึงในตาราง sheets',
  `user_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id ผู้ใช้ที่อ้างถึงในตาราง users',
  `visible_flag` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'เก็บสถานะการมองเห็นข้อมูล',
  `status_flag` ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'เก็บวันที่สร้างข้อมูล',
  `created_by` VARCHAR(255) NOT NULL DEFAULT 'SYSTEM' COMMENT 'เก็บผู้สร้างข้อมูล',
  `updated_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขล่าสุด',
  `updated_by` VARCHAR(255) NULL COMMENT 'เก็บ id ผู้แก้ไขข้อมูลล่าสุด',
  `status_modified_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขสถานะล่าสุด',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_sheet_favorite` (`user_id`, `sheet_id`),
  KEY `idx_users_sheets_favorites_sheet_id` (`sheet_id`),
  CONSTRAINT `fk_users_sheets_favorites_sheet_id`
    FOREIGN KEY (`sheet_id`) REFERENCES `sheets` (`id`),
  CONSTRAINT `fk_users_sheets_favorites_user_id`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บข้อมูลผู้ใช้ที่เพิ่มเอกสารเป็นรายการโปรด';

CREATE TABLE `sheets_reviews` (
  `id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id ข้อมูลรีวิวของชีต',
  `sheet_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id ที่อ้างถึงในตาราง sheets',
  `user_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id ที่อ้างถึงในตาราง users',
  `content` TEXT NULL COMMENT 'เก็บเนื้อหาของรีวิวชีต',
  `score` INT NOT NULL DEFAULT 0 COMMENT 'เก็บคะแนนรีวิวชีต',
  `visible_flag` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'เก็บสถานะการมองเห็นข้อมูล',
  `status_flag` ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'เก็บวันที่สร้างข้อมูล',
  `created_by` VARCHAR(255) NOT NULL DEFAULT 'SYSTEM' COMMENT 'เก็บผู้สร้างข้อมูล',
  `updated_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขล่าสุด',
  `updated_by` VARCHAR(255) NULL COMMENT 'เก็บ id ผู้แก้ไขข้อมูลล่าสุด',
  `status_modified_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขสถานะล่าสุด',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_sheet_review` (`user_id`, `sheet_id`),
  KEY `idx_sheets_reviews_sheet_id` (`sheet_id`),
  CONSTRAINT `fk_sheets_reviews_sheet_id`
    FOREIGN KEY (`sheet_id`) REFERENCES `sheets` (`id`),
  CONSTRAINT `fk_sheets_reviews_user_id`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บข้อมูลรีวิวของชีต';

-- ====================
-- Posts
-- ====================
CREATE TABLE `posts` (
  `id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id โพสต์',
  `sheet_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci COMMENT 'เก็บ id เอกสารสรุปที่อ้างถึงในตาราง sheets',
  `user_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id เอกสารสรุปที่อ้างถึงในตาราง users',
  `content` TEXT NOT NULL COMMENT 'เก็บเนื้อหาของโพสต์',
  `like_count` INT NOT NULL DEFAULT 0 COMMENT 'เก็บจำนวนไลค์',
  `comment_count` INT NOT NULL DEFAULT 0 COMMENT 'เก็บจำนวนคอมเมนต์',
  `share_count` INT NOT NULL DEFAULT 0 COMMENT 'เก็บจำนวนแชร์',
  `visible_flag` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'เก็บสถานะการมองเห็นข้อมูล',
  `status_flag` ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'เก็บวันที่สร้างข้อมูล',
  `created_by` VARCHAR(255) NOT NULL DEFAULT 'SYSTEM' COMMENT 'เก็บผู้สร้างข้อมูล',
  `updated_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขล่าสุด',
  `updated_by` VARCHAR(255) NULL COMMENT 'เก็บ id ผู้แก้ไขข้อมูลล่าสุด',
  `status_modified_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขสถานะล่าสุด',
  PRIMARY KEY (`id`),
  KEY `idx_posts_sheet_id` (`sheet_id`),
  KEY `idx_posts_user_id` (`user_id`),
  KEY `idx_posts_status_flag` (`status_flag`),
  KEY `idx_posts_created_at` (`created_at`),
  CONSTRAINT `fk_posts_sheet_id`
    FOREIGN KEY (`sheet_id`) REFERENCES `sheets` (`id`),
  CONSTRAINT `fk_posts_user_id`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บข้อมูลโพสต์';

CREATE TABLE `posts_likes` (
  `id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id ผู้ถูกใจโพสต์',
  `post_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id โพสต์ที่อ้างถึงในตาราง posts',
  `user_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id ผู้ใช้ที่อ้างถึงในตาราง users',
  `visible_flag` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'เก็บสถานะการมองเห็นข้อมูล',
  `status_flag` ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'เก็บวันที่สร้างข้อมูล',
  `created_by` VARCHAR(255) NOT NULL DEFAULT 'SYSTEM' COMMENT 'เก็บผู้สร้างข้อมูล',
  `updated_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขล่าสุด',
  `updated_by` VARCHAR(255) NULL COMMENT 'เก็บ id ผู้แก้ไขข้อมูลล่าสุด',
  `status_modified_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขสถานะล่าสุด',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_post_like` (`user_id`, `post_id`),
  KEY `idx_posts_likes_post_id` (`post_id`),
  CONSTRAINT `fk_post_likes_post_id`
    FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`),
  CONSTRAINT `fk_post_likes_user_id`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บข้อมูลผู้ถูกใจโพสต์';

CREATE TABLE `posts_comments` (
  `id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id คอมเมนต์โพสต์',
  `post_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id โพสต์ที่อ้างถึงในตาราง posts',
  `user_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id ผู้ใช้ที่อ้างถึงในตาราง users',
  `content` TEXT NOT NULL COMMENT 'เก็บเนื้อหาของคอมเมนต์',
  `visible_flag` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'เก็บสถานะการมองเห็นข้อมูล',
  `status_flag` ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'เก็บวันที่สร้างข้อมูล',
  `created_by` VARCHAR(255) NOT NULL DEFAULT 'SYSTEM' COMMENT 'เก็บผู้สร้างข้อมูล',
  `updated_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขล่าสุด',
  `updated_by` VARCHAR(255) NULL COMMENT 'เก็บ id ผู้แก้ไขข้อมูลล่าสุด',
  `status_modified_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขสถานะล่าสุด',
  PRIMARY KEY (`id`),
  KEY `idx_posts_comments_post_id` (`post_id`),
  KEY `idx_posts_comments_user_id` (`user_id`),
  CONSTRAINT `fk_post_comments_post_id`
    FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`),
  CONSTRAINT `fk_post_comments_user_id`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บข้อมูลคอมเมนต์โพสต์';

CREATE TABLE `posts_shares` (
  `id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id การแชร์โพสต์',
  `post_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id โพสต์ที่อ้างถึงในตาราง posts',
  `user_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id ผู้ใช้ที่แชร์อ้างถึงในตาราง users',
  `visible_flag` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'เก็บสถานะการมองเห็นข้อมูล',
  `status_flag` ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'เก็บวันที่สร้างข้อมูล',
  `created_by` VARCHAR(255) NOT NULL DEFAULT 'SYSTEM' COMMENT 'เก็บผู้สร้างข้อมูล',
  `updated_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขล่าสุด',
  `updated_by` VARCHAR(255) NULL COMMENT 'เก็บ id ผู้แก้ไขข้อมูลล่าสุด',
  `status_modified_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขสถานะล่าสุด',
  PRIMARY KEY (`id`),
  KEY `idx_posts_shares_post_id` (`post_id`),
  KEY `idx_posts_shares_user_id` (`user_id`),
  CONSTRAINT `fk_posts_shares_post_id`
    FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`),
  CONSTRAINT `fk_posts_shares_user_id`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บข้อมูลผู้ใช้ที่แชร์โพสต์';

-- ====================
-- Follows
-- ====================
CREATE TABLE `users_follows` (
  `id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id ของการติดตาม',
  `follower_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id ของผู้ที่เป็นคนกดติดตาม',
  `following_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id ของผู้ที่ถูกติดตาม',
  `visible_flag` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'เก็บสถานะการมองเห็นข้อมูล',
  `status_flag` ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'เก็บวันที่สร้างข้อมูล',
  `created_by` VARCHAR(255) NOT NULL DEFAULT 'SYSTEM' COMMENT 'เก็บผู้สร้างข้อมูล',
  `updated_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขล่าสุด',
  `updated_by` VARCHAR(255) NULL COMMENT 'เก็บ id ผู้แก้ไขข้อมูลล่าสุด',
  `status_modified_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขสถานะล่าสุด',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_follower_following` (`follower_id`, `following_id`),
  KEY `idx_following_id` (`following_id`), 
  CONSTRAINT `fk_follows_follower` FOREIGN KEY (`follower_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_follows_following` FOREIGN KEY (`following_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `check_not_self_follow` CHECK (`follower_id` <> `following_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บข้อมูลการติดตามกันระหว่างผู้ใช้';


-- ====================
-- Reports
-- ====================
CREATE TABLE `report_posts` (
  `id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id รายงานโพสต์',
  `post_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id ของโพสต์ที่ถูกรายงาน',
  `report_type` ENUM('สแปม','เนื้อหาไม่เหมาะสม หรือไม่ถูกต้อง','การกลั่นแกล้ง การคุกคาม หรือการแสดงความเกลียดชัง', 'เนื้อหาเกี่ยวกับความรุนแรง หรือการทำร้ายตัวเอง', 'การละเมิดทรัพย์สินทางปัญญา', 'เนื้อหาสำหรับผู้ใหญ่', 'อื่นๆ') NOT NULL COMMENT 'ประเภทของรายงาน',
  `reporter_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id ผู้รายงาน',
  `content` TEXT NULL COMMENT 'เก็บรายละเอียดของรายงาน',
  `visible_flag` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'เก็บสถานะการมองเห็นข้อมูล',
  `status_flag` ENUM('PENDING','REVIEWING','RESOLVED','REJECTED') NOT NULL DEFAULT 'PENDING' COMMENT 'เก็บสถานะข้อมูล', 
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'เก็บวันที่สร้างข้อมูล',
  `created_by` VARCHAR(255) NOT NULL DEFAULT 'SYSTEM' COMMENT 'เก็บผู้สร้างข้อมูล',
  `updated_at` TIMESTAMP(3) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(3) COMMENT 'เก็บวันที่แก้ไขล่าสุด',
  `updated_by` VARCHAR(255) NULL COMMENT 'เก็บ id ผู้แก้ไขข้อมูลล่าสุด',
  `status_modified_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขสถานะล่าสุด',
  PRIMARY KEY (`id`),
  KEY `idx_post_id` (`post_id`),
  KEY `idx_reporter_id` (`reporter_id`),
  KEY `idx_status_flag` (`status_flag`),
  CONSTRAINT `fk_report_posts_post_id`
    FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_report_posts_reporter_id`
    FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บข้อมูลการรายงานโพสต์';

CREATE TABLE `report_sheets` (
  `id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id รายงานชีต',
  `sheet_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id ของชีตที่ถูกรายงาน',
  `report_type` ENUM('สแปม','เนื้อหาไม่เหมาะสม หรือไม่ถูกต้อง','การกลั่นแกล้ง การคุกคาม หรือการแสดงความเกลียดชัง', 'เนื้อหาเกี่ยวกับความรุนแรง หรือการทำร้ายตัวเอง', 'การละเมิดทรัพย์สินทางปัญญา', 'เนื้อหาสำหรับผู้ใหญ่', 'อื่นๆ') NOT NULL COMMENT 'ประเภทของรายงาน',
  `reporter_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id ผู้รายงาน',
  `content` TEXT NULL COMMENT 'เก็บรายละเอียดของรายงาน',
  `visible_flag` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'เก็บสถานะการมองเห็นข้อมูล',
  `status_flag` ENUM('PENDING','REVIEWING','RESOLVED','REJECTED') NOT NULL DEFAULT 'PENDING' COMMENT 'เก็บสถานะข้อมูล', 
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'เก็บวันที่สร้างข้อมูล',
  `created_by` VARCHAR(255) NOT NULL DEFAULT 'SYSTEM' COMMENT 'เก็บผู้สร้างข้อมูล',
  `updated_at` TIMESTAMP(3) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(3) COMMENT 'เก็บวันที่แก้ไขล่าสุด',
  `updated_by` VARCHAR(255) NULL COMMENT 'เก็บ id ผู้แก้ไขข้อมูลล่าสุด',
  `status_modified_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขสถานะล่าสุด',
  PRIMARY KEY (`id`),
  KEY `idx_sheet_id` (`sheet_id`),
  KEY `idx_reporter_id` (`reporter_id`),
  KEY `idx_status_flag` (`status_flag`),
  CONSTRAINT `fk_report_sheets_sheet_id`
    FOREIGN KEY (`sheet_id`) REFERENCES `sheets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_report_sheets_reporter_id`
    FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บข้อมูลการรายงานชีต';

CREATE TABLE `report_users` (
  `id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id รายงานผู้ใช้',
  `user_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id ของผู้ใช้ที่ถูกรายงาน',
  `report_type` ENUM('โปรไฟล์ปลอม', 'การกลั่นแกล้ง การคุกคาม หรือการแสดงความเกลียดชัง', 'เนื้อหาเกี่ยวกับความรุนแรง หรือการทำร้ายตัวเอง', 'การละเมิดทรัพย์สินทางปัญญา', 'เนื้อหาสำหรับผู้ใหญ่', 'อื่นๆ') NOT NULL COMMENT 'ประเภทของรายงาน',
  `reporter_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id ผู้รายงาน',
  `content` TEXT NULL COMMENT 'เก็บรายละเอียดของรายงาน',
  `visible_flag` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'เก็บสถานะการมองเห็นข้อมูล',
  `status_flag` ENUM('PENDING','REVIEWING','RESOLVED','REJECTED') NOT NULL DEFAULT 'PENDING' COMMENT 'เก็บสถานะข้อมูล', 
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'เก็บวันที่สร้างข้อมูล',
  `created_by` VARCHAR(255) NOT NULL DEFAULT 'SYSTEM' COMMENT 'เก็บผู้สร้างข้อมูล',
  `updated_at` TIMESTAMP(3) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(3) COMMENT 'เก็บวันที่แก้ไขล่าสุด',
  `updated_by` VARCHAR(255) NULL COMMENT 'เก็บ id ผู้แก้ไขข้อมูลล่าสุด',
  `status_modified_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขสถานะล่าสุด',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_reporter_id` (`reporter_id`),
  KEY `idx_status_flag` (`status_flag`),
  CONSTRAINT `fk_report_users_user_id`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_report_users_reporter_id`
    FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บข้อมูลการรายงานผู้ใช้';


-- ====================
-- Plans
-- ====================
CREATE TABLE `plans` (
  `id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id ของแพ็กเกจ',
  `name` VARCHAR(150) NOT NULL COMMENT 'เก็บชื่อแพ็กเกจ',
  `description` TEXT DEFAULT NULL COMMENT 'เก็บคำอธิบายแพ็กเกจ',
  `price` DECIMAL(10,2) NOT NULL COMMENT 'เก็บราคาของแพ็กเกจ',
  `billing_interval` ENUM('DAY','WEEK','MONTH','YEAR') NOT NULL COMMENT 'เก็บหน่วยของรอบการเก็บเงิน (เช่น เดือน)',
  `billing_interval_count` INT NOT NULL DEFAULT 1 COMMENT 'เก็บจำนวนของหน่วย (เช่น 1 เดือน, 3 เดือน)',
  `visible_flag` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'เก็บสถานะการมองเห็นข้อมูล',
  `status_flag` ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'เก็บวันที่สร้างข้อมูล',
  `created_by` VARCHAR(255) NOT NULL DEFAULT 'SYSTEM' COMMENT 'เก็บผู้สร้างข้อมูล',
  `updated_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขล่าสุด',
  `updated_by` VARCHAR(255) NULL COMMENT 'เก็บ id ผู้แก้ไขข้อมูลล่าสุด',
  `status_modified_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขสถานะล่าสุด',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_plan_name` (`name`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บข้อมูลแพ็กเกจสมัครสมาชิก';

CREATE TABLE `users_plans` (
  `id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id ของการสมัครสมาชิกครั้งนี้',
  `user_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id ผู้ใช้ที่อ้างถึงในตาราง users',
  `plan_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id แพ็กเกจที่อ้างถึงในตาราง plans',
  `start_at` TIMESTAMP(3) NOT NULL COMMENT 'เก็บวันที่เริ่มต้นการเป็นสมาชิก',
  `expires_at` TIMESTAMP(3) NOT NULL COMMENT 'เก็บวันที่หมดอายุการเป็นสมาชิก',
  `auto_renew` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'เก็บสถานะการต่ออายุอัตโนมัติ',
  `visible_flag` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'เก็บสถานะการมองเห็นข้อมูล',
  `status_flag` ENUM('PENDING','ACTIVE','INACTIVE','SUSPENDED','TERMINATED') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'เก็บวันที่สร้างข้อมูล',
  `created_by` VARCHAR(255) NOT NULL DEFAULT 'SYSTEM' COMMENT 'เก็บผู้สร้างข้อมูล',
  `updated_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขล่าสุด',
  `updated_by` VARCHAR(255) NULL COMMENT 'เก็บ id ผู้แก้ไขข้อมูลล่าสุด',
  `status_modified_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขสถานะล่าสุด',
  PRIMARY KEY (`id`),
  KEY `idx_users_plans_user_id` (`user_id`),
  KEY `idx_users_plans_plan_id` (`plan_id`),
  CONSTRAINT `fk_users_plans_user_id`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_users_plans_plan_id`
    FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บข้อมูลการสมัครสมาชิกของผู้ใช้';

  

-- ====================
-- Payments
-- ====================
CREATE TABLE `buy_plans` (
  `id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id ประวัติการซื้อแพ็กเกจ',
  `user_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id ผู้ใช้ที่ชำระเงินอ้างถึงในตาราง users',
  `plan_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id แพ็กเกจที่อ้างถึงในตาราง plans',
  `payment_method` ENUM('PROMPTPAY') NOT NULL COMMENT 'เก็บช่องทางการชำระเงิน (ตอนนี้เก็บแค่พร้อมเพย์เท่านั้น)',
  `amount` DECIMAL(10,2) NOT NULL COMMENT 'เก็บจำนวนเงินที่ชำระ',
  `payment_status` ENUM('PENDING', 'SUCCESSFUL', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING' COMMENT 'เก็บสถานะการชำระเงินจาก Gateway',
  `slip_image_url` TEXT DEFAULT NULL COMMENT 'เก็บ URL ของหลักฐานการชำระเงิน',
  `visible_flag` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'เก็บสถานะการมองเห็นข้อมูล',
  `status_flag` ENUM('PENDING','ACTIVE','INACTIVE','SUSPENDED','TERMINATED') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'เก็บวันที่สร้างข้อมูล',
  `created_by` VARCHAR(255) NOT NULL DEFAULT 'SYSTEM' COMMENT 'เก็บผู้สร้างข้อมูล',
  `updated_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขล่าสุด',
  `updated_by` VARCHAR(255) NULL COMMENT 'เก็บ id ผู้แก้ไขข้อมูลล่าสุด',
  `status_modified_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขสถานะล่าสุด',
  PRIMARY KEY (`id`),
  KEY `idx_buy_plans_user_id` (`user_id`),
  KEY `idx_buy_plans_plan_id` (`plan_id`),
  CONSTRAINT `fk_buy_plans_user_id`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_buy_plans_plan_id`
    FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บประวัติการซื้อแพ็กเกจ';

CREATE TABLE `buy_sheets` (
  `id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id ประวัติการซื้อเอกสาร',
  `user_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id ผู้ใช้ที่ชำระเงินอ้างถึงในตาราง users',
  `sheet_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id เอกสารที่อ้างถึงในตาราง sheets',
  `payment_method` ENUM('PROMPTPAY') NOT NULL COMMENT 'เก็บช่องทางการชำระเงิน (ตอนนี้เก็บแค่พร้อมเพย์เท่านั้น)',
  `amount` DECIMAL(10,2) NOT NULL COMMENT 'เก็บจำนวนเงินที่ชำระ',
  `payment_status` ENUM('PENDING', 'SUCCESSFUL', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING' COMMENT 'เก็บสถานะการชำระเงินจาก Gateway',
  `slip_image_url` TEXT DEFAULT NULL COMMENT 'เก็บ URL ของหลักฐานการชำระเงิน',
  `visible_flag` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'เก็บสถานะการมองเห็นข้อมูล',
  `status_flag` ENUM('PENDING','ACTIVE','INACTIVE','SUSPENDED','TERMINATED') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'เก็บวันที่สร้างข้อมูล',
  `created_by` VARCHAR(255) NOT NULL DEFAULT 'SYSTEM' COMMENT 'เก็บผู้สร้างข้อมูล',
  `updated_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขล่าสุด',
  `updated_by` VARCHAR(255) NULL COMMENT 'เก็บ id ผู้แก้ไขข้อมูลล่าสุด',
  `status_modified_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขสถานะล่าสุด',
  PRIMARY KEY (`id`),
  KEY `idx_buy_sheets_user_id` (`user_id`),
  KEY `idx_buy_sheets_sheet_id` (`sheet_id`),
  CONSTRAINT `fk_buy_sheets_user_id`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_buy_sheets_sheet_id`
    FOREIGN KEY (`sheet_id`) REFERENCES `sheets` (`id`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บประวัติการซื้อเอกสาร';

CREATE TABLE `wallet_topups` (
  `id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id ประวัติการเติมเงิน',
  `user_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id ผู้ใช้ที่ชำระเงินอ้างถึงในตาราง users',
  `payment_method` ENUM('PROMPTPAY') NOT NULL COMMENT 'เก็บช่องทางการชำระเงิน (ตอนนี้เก็บแค่พร้อมเพย์เท่านั้น)',
  `amount` DECIMAL(10,2) NOT NULL COMMENT 'เก็บจำนวนเงินที่ชำระ',
  `payment_status` ENUM('PENDING', 'SUCCESSFUL', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING' COMMENT 'เก็บสถานะการชำระเงินจาก Gateway',
  `slip_image_url` TEXT DEFAULT NULL COMMENT 'เก็บ URL ของหลักฐานการชำระเงิน',
  `visible_flag` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'เก็บสถานะการมองเห็นข้อมูล',
  `status_flag` ENUM('PENDING','ACTIVE','INACTIVE','SUSPENDED','TERMINATED') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'เก็บวันที่สร้างข้อมูล',
  `created_by` VARCHAR(255) NOT NULL DEFAULT 'SYSTEM' COMMENT 'เก็บผู้สร้างข้อมูล',
  `updated_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขล่าสุด',
  `updated_by` VARCHAR(255) NULL COMMENT 'เก็บ id ผู้แก้ไขข้อมูลล่าสุด',
  `status_modified_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขสถานะล่าสุด',
  PRIMARY KEY (`id`),
  KEY `idx_wallet_topups_user_id` (`user_id`),
  CONSTRAINT `fk_wallet_topups_user_id`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บประวัติการเติมเงิน';


DELIMITER $$

CREATE TRIGGER before_insert_roles
BEFORE INSERT ON `roles`
FOR EACH ROW
BEGIN
  IF NEW.`id` IS NULL OR NEW.`id` = '' THEN
    SET NEW.`id` = UUIDV7();
  END IF;
END$$

CREATE TRIGGER before_insert_permissions
BEFORE INSERT ON `permissions`
FOR EACH ROW
BEGIN
  IF NEW.`id` IS NULL OR NEW.`id` = '' THEN
    SET NEW.`id` = UUIDV7();
  END IF;
END$$

CREATE TRIGGER before_insert_scopes
BEFORE INSERT ON `scopes`
FOR EACH ROW
BEGIN
  IF NEW.`id` IS NULL OR NEW.`id` = '' THEN
    SET NEW.`id` = UUIDV7();
  END IF;
END$$

CREATE TRIGGER before_insert_users
BEFORE INSERT ON `users`
FOR EACH ROW
BEGIN
  IF NEW.`id` IS NULL OR NEW.`id` = '' THEN
    SET NEW.`id` = UUIDV7();
  END IF;
END$$

CREATE TRIGGER before_insert_user_providers
BEFORE INSERT ON `user_providers`
FOR EACH ROW
BEGIN
  IF NEW.`id` IS NULL OR NEW.`id` = '' THEN
    SET NEW.`id` = UUIDV7();
  END IF;
END$$

CREATE TRIGGER before_insert_sessions
BEFORE INSERT ON `sessions`
FOR EACH ROW
BEGIN
  IF NEW.`id` IS NULL OR NEW.`id` = '' THEN
    SET NEW.`id` = UUIDV7();
  END IF;
END$$

CREATE TRIGGER before_insert_tokens
BEFORE INSERT ON `tokens`
FOR EACH ROW
BEGIN
  IF NEW.`id` IS NULL OR NEW.`id` = '' THEN
    SET NEW.`id` = UUIDV7();
  END IF;
END$$

CREATE TRIGGER before_insert_sheets
BEFORE INSERT ON `sheets`
FOR EACH ROW
BEGIN
  IF NEW.`id` IS NULL OR NEW.`id` = '' THEN
    SET NEW.`id` = UUIDV7();
  END IF;
END$$

CREATE TRIGGER before_insert_categories
BEFORE INSERT ON `categories`
FOR EACH ROW
BEGIN
  IF NEW.`id` IS NULL OR NEW.`id` = '' THEN
    SET NEW.`id` = UUIDV7();
  END IF;
END$$

CREATE TRIGGER before_insert_keywords
BEFORE INSERT ON `keywords`
FOR EACH ROW
BEGIN
  IF NEW.`id` IS NULL OR NEW.`id` = '' THEN
    SET NEW.`id` = UUIDV7();
  END IF;
END$$

CREATE TRIGGER before_insert_sheets_files
BEFORE INSERT ON `sheets_files`
FOR EACH ROW
BEGIN
  IF NEW.`id` IS NULL OR NEW.`id` = '' THEN
    SET NEW.`id` = UUIDV7();
  END IF;
END$$

CREATE TRIGGER before_insert_sheets_questions
BEFORE INSERT ON `sheets_questions`
FOR EACH ROW
BEGIN
  IF NEW.`id` IS NULL OR NEW.`id` = '' THEN
    SET NEW.`id` = UUIDV7();
  END IF;
END$$

CREATE TRIGGER before_insert_sheets_answers
BEFORE INSERT ON `sheets_answers`
FOR EACH ROW
BEGIN
  IF NEW.`id` IS NULL OR NEW.`id` = '' THEN
    SET NEW.`id` = UUIDV7();
  END IF;
END$$

CREATE TRIGGER before_insert_users_sheets_answers
BEFORE INSERT ON `users_sheets_answers`
FOR EACH ROW
BEGIN
  IF NEW.`id` IS NULL OR NEW.`id` = '' THEN
    SET NEW.`id` = UUIDV7();
  END IF;
END$$

CREATE TRIGGER before_insert_users_sheets_favorites
BEFORE INSERT ON `users_sheets_favorites`
FOR EACH ROW
BEGIN
  IF NEW.`id` IS NULL OR NEW.`id` = '' THEN
    SET NEW.`id` = UUIDV7();
  END IF;
END$$

CREATE TRIGGER before_insert_sheets_reviews
BEFORE INSERT ON `sheets_reviews`
FOR EACH ROW
BEGIN
  IF NEW.`id` IS NULL OR NEW.`id` = '' THEN
    SET NEW.`id` = UUIDV7();
  END IF;
END$$

CREATE TRIGGER before_insert_posts
BEFORE INSERT ON `posts`
FOR EACH ROW
BEGIN
  IF NEW.`id` IS NULL OR NEW.`id` = '' THEN
    SET NEW.`id` = UUIDV7();
  END IF;
END$$

CREATE TRIGGER before_insert_posts_likes
BEFORE INSERT ON `posts_likes`
FOR EACH ROW
BEGIN
  IF NEW.`id` IS NULL OR NEW.`id` = '' THEN
    SET NEW.`id` = UUIDV7();
  END IF;
END$$

CREATE TRIGGER before_insert_posts_comments
BEFORE INSERT ON `posts_comments`
FOR EACH ROW
BEGIN
  IF NEW.`id` IS NULL OR NEW.`id` = '' THEN
    SET NEW.`id` = UUIDV7();
  END IF;
END$$

CREATE TRIGGER before_insert_posts_shares
BEFORE INSERT ON `posts_shares`
FOR EACH ROW
BEGIN
  IF NEW.`id` IS NULL OR NEW.`id` = '' THEN
    SET NEW.`id` = UUIDV7();
  END IF;
END$$

CREATE TRIGGER before_insert_users_follows
BEFORE INSERT ON `users_follows`
FOR EACH ROW
BEGIN
  IF NEW.`id` IS NULL OR NEW.`id` = '' THEN
    SET NEW.`id` = UUIDV7();
  END IF;
END$$

CREATE TRIGGER before_insert_report_posts
BEFORE INSERT ON `report_posts`
FOR EACH ROW
BEGIN
  IF NEW.`id` IS NULL OR NEW.`id` = '' THEN
    SET NEW.`id` = UUIDV7();
  END IF;
END$$

CREATE TRIGGER before_insert_report_sheets
BEFORE INSERT ON `report_sheets`
FOR EACH ROW
BEGIN
  IF NEW.`id` IS NULL OR NEW.`id` = '' THEN
    SET NEW.`id` = UUIDV7();
  END IF;
END$$

CREATE TRIGGER before_insert_report_users
BEFORE INSERT ON `report_users`
FOR EACH ROW
BEGIN
  IF NEW.`id` IS NULL OR NEW.`id` = '' THEN
    SET NEW.`id` = UUIDV7();
  END IF;
END$$

CREATE TRIGGER before_insert_plans
BEFORE INSERT ON `plans`
FOR EACH ROW
BEGIN
  IF NEW.`id` IS NULL OR NEW.`id` = '' THEN
    SET NEW.`id` = UUIDV7();
  END IF;
END$$

CREATE TRIGGER before_insert_users_plans
BEFORE INSERT ON `users_plans`
FOR EACH ROW
BEGIN
  IF NEW.`id` IS NULL OR NEW.`id` = '' THEN
    SET NEW.`id` = UUIDV7();
  END IF;
END$$

CREATE TRIGGER before_insert_buy_plans
BEFORE INSERT ON `buy_plans`
FOR EACH ROW
BEGIN
  IF NEW.`id` IS NULL OR NEW.`id` = '' THEN
    SET NEW.`id` = UUIDV7();
  END IF;
END$$

CREATE TRIGGER before_insert_buy_sheets
BEFORE INSERT ON `buy_sheets`
FOR EACH ROW
BEGIN
  IF NEW.`id` IS NULL OR NEW.`id` = '' THEN
    SET NEW.`id` = UUIDV7();
  END IF;
END$$

CREATE TRIGGER before_insert_wallet_topups
BEFORE INSERT ON `wallet_topups`
FOR EACH ROW
BEGIN
  IF NEW.`id` IS NULL OR NEW.`id` = '' THEN
    SET NEW.`id` = UUIDV7();
  END IF;
END$$

DELIMITER ;
SET FOREIGN_KEY_CHECKS = 1;