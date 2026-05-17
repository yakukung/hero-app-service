ALTER TABLE `buy_sheets`
  MODIFY `payment_method` ENUM('PROMPTPAY','WALLET') NOT NULL COMMENT 'เก็บช่องทางการชำระเงิน';

ALTER TABLE `buy_plans`
  MODIFY `payment_method` ENUM('PROMPTPAY','WALLET') NOT NULL COMMENT 'เก็บช่องทางการชำระเงิน';

ALTER TABLE `wallet_topups`
  MODIFY `payment_method` ENUM('PROMPTPAY','WALLET') NOT NULL COMMENT 'เก็บช่องทางการชำระเงิน';

ALTER TABLE `buy_sheets`
  ADD INDEX `idx_buy_sheets_user_status_visible` (`user_id`, `payment_status`, `visible_flag`),
  ADD INDEX `idx_buy_sheets_sheet_status_visible` (`sheet_id`, `payment_status`, `visible_flag`);

ALTER TABLE `wallet_topups`
  ADD INDEX `idx_wallet_topups_user_status_visible` (`user_id`, `payment_status`, `visible_flag`);

ALTER TABLE `buy_plans`
  ADD INDEX `idx_buy_plans_user_status_visible` (`user_id`, `payment_status`, `visible_flag`);

ALTER TABLE `users_plans`
  ADD INDEX `idx_users_plans_user_status_expiry` (`user_id`, `status_flag`, `visible_flag`, `expires_at`);

ALTER TABLE `report_posts`
  ADD INDEX `idx_report_posts_reporter_visible` (`reporter_id`, `visible_flag`);

ALTER TABLE `report_sheets`
  ADD INDEX `idx_report_sheets_reporter_visible` (`reporter_id`, `visible_flag`);

ALTER TABLE `report_users`
  ADD INDEX `idx_report_users_reporter_visible` (`reporter_id`, `visible_flag`);
