-- DROP FUNCTION IF EXISTS `UUIDV7`

-- DROP TABLE IF EXISTS `users_plans`;
-- DROP TABLE IF EXISTS `plans`;
-- DROP TABLE IF EXISTS `users_payments`;
-- DROP TABLE IF EXISTS `users_reports`;
-- DROP TABLE IF EXISTS `posts_shares`;
-- DROP TABLE IF EXISTS `posts_comments`;
-- DROP TABLE IF EXISTS `posts_likes`;
-- DROP TABLE IF EXISTS `posts`;
-- DROP TABLE IF EXISTS `users_sheets_favorites`;
-- DROP TABLE IF EXISTS `users_sheets_answers`;
-- DROP TABLE IF EXISTS `sheets_answers`;
-- DROP TABLE IF EXISTS `sheets_questions`;
-- DROP TABLE IF EXISTS `sheets_files`;
-- DROP TABLE IF EXISTS `sheets_keywords`;
-- DROP TABLE IF EXISTS `sheets_categories`;
-- DROP TABLE IF EXISTS `sheets`;
-- DROP TABLE IF EXISTS `keywords`;
-- DROP TABLE IF EXISTS `categories`;
-- DROP TABLE IF EXISTS `tokens`;
-- DROP TABLE IF EXISTS `sessions`;
-- DROP TABLE IF EXISTS `user_providers`;
-- DROP TABLE IF EXISTS `users`;
-- DROP TABLE IF EXISTS `scopes`;
-- DROP TABLE IF EXISTS `permissions`;
-- DROP TABLE IF EXISTS `roles`;

-- DROP TRIGGER IF EXISTS `before_insert_roles`;
-- DROP TRIGGER IF EXISTS `before_insert_permissions`;
-- DROP TRIGGER IF EXISTS `before_insert_scopes`;
-- DROP TRIGGER IF EXISTS `before_insert_users`;
-- DROP TRIGGER IF EXISTS `before_insert_user_providers`;
-- DROP TRIGGER IF EXISTS `before_insert_sessions`;
-- DROP TRIGGER IF EXISTS `before_insert_tokens`;
-- DROP TRIGGER IF EXISTS `before_insert_categories`;
-- DROP TRIGGER IF EXISTS `before_insert_keywords`;
-- DROP TRIGGER IF EXISTS `before_insert_sheets`;
-- DROP TRIGGER IF EXISTS `before_insert_sheets_categories`;
-- DROP TRIGGER IF EXISTS `before_insert_sheets_keywords`;
-- DROP TRIGGER IF EXISTS `before_insert_sheets_files`;
-- DROP TRIGGER IF EXISTS `before_insert_sheets_questions`;
-- DROP TRIGGER IF EXISTS `before_insert_sheets_answers`;
-- DROP TRIGGER IF EXISTS `before_insert_users_sheets_answers`;
-- DROP TRIGGER IF EXISTS `before_insert_users_sheets_favorites`;
-- DROP TRIGGER IF EXISTS `before_insert_posts`;
-- DROP TRIGGER IF EXISTS `before_insert_post_likes`;
-- DROP TRIGGER IF EXISTS `before_insert_post_comments`;
-- DROP TRIGGER IF EXISTS `before_insert_posts_shares`;
-- DROP TRIGGER IF EXISTS `before_insert_users_reports`;
-- DROP TRIGGER IF EXISTS `before_insert_user_payments`;
-- DROP TRIGGER IF EXISTS `before_insert_plans`;
-- DROP TRIGGER IF EXISTS `before_insert_users_plans`;


-- =========================================
-- Function: UUIDV7 (RFC 9562 compliant)
-- =========================================
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
END


-- ====================
-- Tables
-- Authentication
-- ====================
CREATE TABLE `roles` (
  `id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id กลุ่มผู้ใช้งาน',
  `name` VARCHAR(30) DEFAULT NULL COMMENT 'เก็บชื่อกลุ่มผู้ใช้งาน',
  `visible_flag` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'เก็บสถานะการมองเห็นข้อมูล',
  `status_flag` ENUM('PENDING','ACTIVE','INACTIVE','SUSPENDED','TERMINATED') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
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
  `status_flag` ENUM('PENDING','ACTIVE','INACTIVE','SUSPENDED','TERMINATED') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
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
  `status_flag` ENUM('PENDING','ACTIVE','INACTIVE','SUSPENDED','TERMINATED') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_email` (`email`),
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
  `refresh_token` BINARY(32) NOT NULL COMMENT 'เก็บ refresh token',
  `issued_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'เก็บเวลาที่ออก refresh token',
  `expires_at` TIMESTAMP(3) NOT NULL COMMENT 'เก็บเวลาหมดอายุของ refresh token',
  `revoked_flag` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'สถานะเพิกถอน refresh token',
  `ip_address` VARCHAR(45) DEFAULT NULL COMMENT 'เก็บที่อยู่ IP ของผู้ใช้ขณะออก refresh token',
  `user_agent` VARCHAR(500) DEFAULT NULL COMMENT 'เก็บข้อมูล User Agent ของอุปกรณ์หรือเบราว์เซอร์',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_refresh_token` (`refresh_token`),
  CONSTRAINT `fk_sessions_user_id`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บข้อมูล Refresh Token ของผู้ใช้';

CREATE TABLE `tokens` (
  `id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id access token',
  `session_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id session ที่อ้างถึงในตาราง sessions',
  `access_token` BINARY(32) NOT NULL COMMENT 'เก็บ access token',
  `issued_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'เก็บเวลาที่ออก access token',
  `expires_at` TIMESTAMP(3) NOT NULL COMMENT 'เก็บเวลาหมดอายุของ access token',
  `revoked_flag` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'สถานะเพิกถอน access token',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_access_token` (`access_token`),
  CONSTRAINT `fk_tokens_session_id`
    FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บข้อมูล Access Token ของผู้ใช้';


-- ====================
-- Sheets
-- ====================
CREATE TABLE `categories` (
  `id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id หมวดหมู่เอกสาร',
  `name` VARCHAR(150) NOT NULL COMMENT 'เก็บชื่อหมวดหมู่เอกสาร',
  `visible_flag` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'เก็บสถานะการมองเห็นข้อมูล',
  `status_flag` ENUM('PENDING','ACTIVE','INACTIVE','SUSPENDED','TERMINATED') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'เก็บวันที่สร้างข้อมูล',
  `created_by` VARCHAR(255) NOT NULL DEFAULT 'SYSTEM' COMMENT 'เก็บผู้สร้างข้อมูล',
  `updated_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขล่าสุด',
  `updated_by` VARCHAR(255) NULL COMMENT 'เก็บ id ผู้แก้ไขข้อมูลล่าสุด',
  `status_modified_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขสถานะล่าสุด',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_sheet_category_name` (`name`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บข้อมูลหมวดหมู่เอกสารสรุปเนื้อหา';

CREATE TABLE `keywords` (
  `id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id คำค้นหา',
  `name` VARCHAR(150) NOT NULL COMMENT 'เก็บชื่อคำค้นหา',
  `usage_count` INT NOT NULL DEFAULT 0 COMMENT 'เก็บจำนวนการใช้งาน',
  `visible_flag` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'เก็บสถานะการมองเห็นข้อมูล',
  `status_flag` ENUM('PENDING','ACTIVE','INACTIVE','SUSPENDED','TERMINATED') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'เก็บวันที่สร้างข้อมูล',
  `created_by` VARCHAR(255) NOT NULL DEFAULT 'SYSTEM' COMMENT 'เก็บผู้สร้างข้อมูล',
  `updated_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขล่าสุด',
  `updated_by` VARCHAR(255) NULL COMMENT 'เก็บ id ผู้แก้ไขข้อมูลล่าสุด',
  `status_modified_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขสถานะล่าสุด',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_keyword_name` (`name`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บข้อมูลคำค้นหา';

CREATE TABLE `sheets` (
  `id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id เอกสารสรุปเนื้อหา',
  `author_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id ผู้ใช้ที่อ้างถึงในตาราง users',
  `title` VARCHAR(255) NOT NULL COMMENT 'เก็บชื่อเอกสารสรุป',
  `description` TEXT DEFAULT NULL COMMENT 'เก็บคำอธิบายเพิ่มเติมของเอกสาร',
  `rating` DECIMAL(3,1) DEFAULT NULL COMMENT 'เก็บคะแนนความพึงพอใจ',
  `price` DECIMAL(10,2) DEFAULT NULL COMMENT 'เก็บราคาเอกสาร',
  `visible_flag` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'เก็บสถานะการมองเห็นข้อมูล',
  `status_flag` ENUM('PENDING','ACTIVE','INACTIVE','SUSPENDED','TERMINATED') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'เก็บวันที่สร้างข้อมูล',
  `created_by` VARCHAR(255) NOT NULL DEFAULT 'SYSTEM' COMMENT 'เก็บผู้สร้างข้อมูล',
  `updated_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขล่าสุด',
  `updated_by` VARCHAR(255) NULL COMMENT 'เก็บ id ผู้แก้ไขข้อมูลล่าสุด',
  `status_modified_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขสถานะล่าสุด',
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_sheets_author_id`
    FOREIGN KEY (`author_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บข้อมูลเอกสารสรุปเนื้อหา';

CREATE TABLE `sheets_categories` (
  `id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id การเชื่อมโยงเอกสารกับหมวดหมู่',
  `sheet_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id เอกสารสรุปที่อ้างถึงในตาราง sheets',
  `category_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id หมวดหมู่ที่อ้างถึงในตาราง categories',
  `visible_flag` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'เก็บสถานะการมองเห็นข้อมูล',
  `status_flag` ENUM('PENDING','ACTIVE','INACTIVE','SUSPENDED','TERMINATED') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'เก็บวันที่สร้างข้อมูล',
  `created_by` VARCHAR(255) NOT NULL DEFAULT 'SYSTEM' COMMENT 'เก็บผู้สร้างข้อมูล',
  `updated_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขล่าสุด',
  `updated_by` VARCHAR(255) NULL COMMENT 'เก็บ id ผู้แก้ไขข้อมูลล่าสุด',
  `status_modified_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขสถานะล่าสุด',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_sheet_category` (`sheet_id`, `category_id`),
  KEY `idx_sheets_categories_category_id` (`category_id`),
  CONSTRAINT `fk_sheets_categories_sheet_id`
    FOREIGN KEY (`sheet_id`) REFERENCES `sheets` (`id`),
  CONSTRAINT `fk_sheets_categories_category_id`
    FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเชื่อมโยงเอกสารสรุปเนื้อหากับหมวดหมู่';

CREATE TABLE `sheets_keywords` (
  `id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id การเชื่อมโยงเอกสารกับคำค้นหา',
  `sheet_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id เอกสารสรุปที่อ้างถึงในตาราง sheets',
  `keyword_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id คำค้นหาที่อ้างถึงในตาราง keywords',
  `visible_flag` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'เก็บสถานะการมองเห็นข้อมูล',
  `status_flag` ENUM('PENDING','ACTIVE','INACTIVE','SUSPENDED','TERMINATED') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'เก็บวันที่สร้างข้อมูล',
  `created_by` VARCHAR(255) NOT NULL DEFAULT 'SYSTEM' COMMENT 'เก็บผู้สร้างข้อมูล',
  `updated_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขล่าสุด',
  `updated_by` VARCHAR(255) NULL COMMENT 'เก็บ id ผู้แก้ไขข้อมูลล่าสุด',
  `status_modified_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขสถานะล่าสุด',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_sheet_keyword` (`sheet_id`, `keyword_id`),
  KEY `idx_sheets_keywords_keyword_id` (`keyword_id`),
  CONSTRAINT `fk_sheets_keywords_sheet_id`
    FOREIGN KEY (`sheet_id`) REFERENCES `sheets` (`id`),
  CONSTRAINT `fk_sheets_keywords_keyword_id`
    FOREIGN KEY (`keyword_id`) REFERENCES `keywords` (`id`)
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
  `status_flag` ENUM('PENDING','ACTIVE','INACTIVE','SUSPENDED','TERMINATED') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
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
  `status_flag` ENUM('PENDING','ACTIVE','INACTIVE','SUSPENDED','TERMINATED') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
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
  `status_flag` ENUM('PENDING','ACTIVE','INACTIVE','SUSPENDED','TERMINATED') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'เก็บวันที่สร้างข้อมูล',
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
  `status_flag` ENUM('PENDING','ACTIVE','INACTIVE','SUSPENDED','TERMINATED') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
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
  `status_flag` ENUM('PENDING','ACTIVE','INACTIVE','SUSPENDED','TERMINATED') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
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


-- ====================
-- Posts
-- ====================
CREATE TABLE `posts` (
  `id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id โพสต์',
  `sheet_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id เอกสารสรุปที่อ้างถึงในตาราง sheets',
  `user_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id เอกสารสรุปที่อ้างถึงในตาราง users',
  `content` TEXT NOT NULL COMMENT 'เก็บเนื้อหาของโพสต์',
  `like_count` INT NOT NULL DEFAULT 0 COMMENT 'เก็บจำนวนไลค์',
  `comment_count` INT NOT NULL DEFAULT 0 COMMENT 'เก็บจำนวนคอมเมนต์',
  `share_count` INT NOT NULL DEFAULT 0 COMMENT 'เก็บจำนวนแชร์',
  `visible_flag` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'เก็บสถานะการมองเห็นข้อมูล',
  `status_flag` ENUM('PENDING','ACTIVE','INACTIVE','SUSPENDED','TERMINATED') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'เก็บวันที่สร้างข้อมูล',
  `created_by` VARCHAR(255) NOT NULL DEFAULT 'SYSTEM' COMMENT 'เก็บผู้สร้างข้อมูล',
  `updated_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขล่าสุด',
  `updated_by` VARCHAR(255) NULL COMMENT 'เก็บ id ผู้แก้ไขข้อมูลล่าสุด',
  `status_modified_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขสถานะล่าสุด',
  PRIMARY KEY (`id`),
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
  `status_flag` ENUM('PENDING','ACTIVE','INACTIVE','SUSPENDED','TERMINATED') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'เก็บวันที่สร้างข้อมูล',
  `created_by` VARCHAR(255) NOT NULL DEFAULT 'SYSTEM' COMMENT 'เก็บผู้สร้างข้อมูล',
  `updated_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขล่าสุด',
  `updated_by` VARCHAR(255) NULL COMMENT 'เก็บ id ผู้แก้ไขข้อมูลล่าสุด',
  `status_modified_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขสถานะล่าสุด',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_post_like` (user_id, post_id),
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
  `status_flag` ENUM('PENDING','ACTIVE','INACTIVE','SUSPENDED','TERMINATED') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'เก็บวันที่สร้างข้อมูล',
  `created_by` VARCHAR(255) NOT NULL DEFAULT 'SYSTEM' COMMENT 'เก็บผู้สร้างข้อมูล',
  `updated_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขล่าสุด',
  `updated_by` VARCHAR(255) NULL COMMENT 'เก็บ id ผู้แก้ไขข้อมูลล่าสุด',
  `status_modified_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขสถานะล่าสุด',
  PRIMARY KEY (`id`),
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
  `status_flag` ENUM('PENDING','ACTIVE','INACTIVE','SUSPENDED','TERMINATED') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
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

CREATE TABLE `users_reports` (
  `id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id รายงาน',
  `reference_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id ของสิ่งที่ถูกรายงาน',
  `reference_table` VARCHAR(255) NOT NULL COMMENT 'เก็บชื่อตารางของสิ่งที่ถูกรายงาน',
  `report_type` ENUM('SPAM','ABUSE','BUG','OTHER') NOT NULL COMMENT 'ประเภทของรายงาน',
  `reporter_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id ผู้รายงาน',
  `content` TEXT NOT NULL COMMENT 'เก็บรายละเอียดของรายงาน',
  `visible_flag` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'เก็บสถานะการมองเห็นข้อมูล',
  `status_flag` ENUM('PENDING','REVIEWING','RESOLVED','REJECTED') NOT NULL DEFAULT 'PENDING' COMMENT 'เก็บสถานะข้อมูล', 
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'เก็บวันที่สร้างข้อมูล',
  `created_by` VARCHAR(255) NOT NULL DEFAULT 'SYSTEM' COMMENT 'เก็บผู้สร้างข้อมูล',
  `updated_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขล่าสุด',
  `updated_by` VARCHAR(255) NULL COMMENT 'เก็บ id ผู้แก้ไขข้อมูลล่าสุด',
  `status_modified_at` TIMESTAMP(3) NULL COMMENT 'เก็บวันที่แก้ไขสถานะล่าสุด',
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_users_reports_reporter_id`
    FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บข้อมูลรายงาน';


CREATE TABLE `users_payments` (
  `id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id ประวัติการชำระเงิน',
  `user_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id ผู้ใช้ที่ชำระเงินอ้างถึงในตาราง users',
  `reference_id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id ของสิ่งที่ชำระเงิน',
  `reference_table` VARCHAR(100) NOT NULL COMMENT 'เก็บชื่อตารางของสิ่งที่ชำระเงิน',
  `payment_method` ENUM('PROMPTPAY') NOT NULL COMMENT 'เก็บช่องทางการชำระเงิน (ตอนนี้เก็บแค่พร้อมเพย์เท่านั้น)',
  `amount` DECIMAL(10,2) NOT NULL COMMENT 'เก็บจำนวนเงินที่ชำระ',
  `currency` VARCHAR(10) NOT NULL DEFAULT 'THB' COMMENT 'เก็บสกุลเงิน (เช่น THB)',
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
  KEY `idx_user_payments_user_id` (`user_id`),
  CONSTRAINT `fk_user_payments_user_id`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บประวัติการชำระเงินของผู้ใช้';

-- ====================
-- Plans
-- ====================
CREATE TABLE `plans` (
  `id` CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL COMMENT 'เก็บ id ของแพ็กเกจ',
  `name` VARCHAR(150) NOT NULL COMMENT 'เก็บชื่อแพ็กเกจ (เช่น Pro รายเดือน)',
  `description` TEXT DEFAULT NULL COMMENT 'เก็บคำอธิบายแพ็กเกจ',
  `price` DECIMAL(10,2) NOT NULL COMMENT 'เก็บราคาของแพ็กเกจ',
  `currency` VARCHAR(10) NOT NULL DEFAULT 'THB' COMMENT 'เก็บสกุลเงิน',
  `billing_interval` ENUM('DAY','WEEK','MONTH','YEAR') NOT NULL COMMENT 'เก็บหน่วยของรอบการเก็บเงิน (เช่น เดือน)',
  `billing_interval_count` INT NOT NULL DEFAULT 1 COMMENT 'เก็บจำนวนของหน่วย (เช่น 1 เดือน, 3 เดือน)',
  `visible_flag` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'เก็บสถานะการมองเห็นข้อมูล',
  `status_flag` ENUM('PENDING','ACTIVE','INACTIVE','SUSPENDED','TERMINATED') NOT NULL DEFAULT 'ACTIVE' COMMENT 'เก็บสถานะข้อมูล',
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



-- =========================================
-- Triggers
-- =========================================
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

CREATE TRIGGER before_insert_sheets
BEFORE INSERT ON `sheets`
FOR EACH ROW
BEGIN
  IF NEW.`id` IS NULL OR NEW.`id` = '' THEN
    SET NEW.`id` = UUIDV7();
  END IF;
END$$

CREATE TRIGGER before_insert_sheets_categories
BEFORE INSERT ON `sheets_categories`
FOR EACH ROW
BEGIN
  IF NEW.`id` IS NULL OR NEW.`id` = '' THEN
    SET NEW.`id` = UUIDV7();
  END IF;
END$$

CREATE TRIGGER before_insert_sheets_keywords
BEFORE INSERT ON `sheets_keywords`
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

CREATE TRIGGER before_insert_posts
BEFORE INSERT ON `posts`
FOR EACH ROW
BEGIN
  IF NEW.`id` IS NULL OR NEW.`id` = '' THEN
    SET NEW.`id` = UUIDV7();
  END IF;
END$$

CREATE TRIGGER before_insert_post_likes
BEFORE INSERT ON `posts_likes`
FOR EACH ROW
BEGIN
  IF NEW.`id` IS NULL OR NEW.`id` = '' THEN
    SET NEW.`id` = UUIDV7();
  END IF;
END$$

CREATE TRIGGER before_insert_post_comments
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

CREATE TRIGGER before_insert_users_reports
BEFORE INSERT ON `users_reports`
FOR EACH ROW
BEGIN
  IF NEW.`id` IS NULL OR NEW.`id` = '' THEN
    SET NEW.`id` = UUIDV7();
  END IF;
END$$

CREATE TRIGGER before_insert_user_payments
BEFORE INSERT ON `users_payments`
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
DELIMITER ;
