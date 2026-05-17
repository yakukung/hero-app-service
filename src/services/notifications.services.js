import { Op } from "sequelize";
import { repository as notificationsRepository } from "../repositories/notifications.repositories.js";
import { responseTemplates } from "../utils/response.utils.js";
import { sortByCreatedAtDesc, toPlain } from "../utils/backend.utils.js";

const mapReportNotification = (row, referenceTable, referenceKey) => {
  const report = toPlain(row);
  return {
    id: `${referenceTable}:${report.id}`,
    title: "สถานะรายงาน",
    message: `รายงานของคุณอยู่ในสถานะ ${report.status_flag}`,
    reference_table: referenceTable,
    reference_id: report[referenceKey],
    report_id: report.id,
    report_type: report.report_type,
    status_flag: report.status_flag,
    is_read: false,
    created_at: report.created_at,
  };
};

export const service = {
  async list(req) {
    const where = {
      reporter_id: req.user.id,
      visible_flag: {
        [Op.ne]: false,
      },
    };

    const { postReports, sheetReports, userReports } =
      await notificationsRepository.findReportsByWhere(where);

    const notifications = [
      ...postReports.map((row) =>
        mapReportNotification(row, "posts", "post_id"),
      ),
      ...sheetReports.map((row) =>
        mapReportNotification(row, "sheets", "sheet_id"),
      ),
      ...userReports.map((row) =>
        mapReportNotification(row, "users", "user_id"),
      ),
    ];

    return responseTemplates.setOKResponse({
      notifications: sortByCreatedAtDesc(notifications),
    });
  },

  async markRead() {
    return responseTemplates.setOKResponse({
      is_read: true,
    });
  },
};
