import { sequelize } from "../configs/sequelize.configs.js";
import { RESPONSE_MESSAGES } from "../constants/response.constant.js";
import { repository as reportsRepository } from "../repositories/reports.repositories.js";
import { message, toPlain } from "../utils/backend.utils.js";
import { responseTemplates } from "../utils/response.utils.js";

const POST_SHEET_REPORT_TYPE_MAP = {
  SPAM: "สแปม",
  INAPPROPRIATE: "เนื้อหาไม่เหมาะสม หรือไม่ถูกต้อง",
  HARASSMENT: "การกลั่นแกล้ง การคุกคาม หรือการแสดงความเกลียดชัง",
  VIOLENCE: "เนื้อหาเกี่ยวกับความรุนแรง หรือการทำร้ายตัวเอง",
  INFRINGEMENT: "การละเมิดทรัพย์สินทางปัญญา",
  ADULT: "เนื้อหาสำหรับผู้ใหญ่",
  OTHER: "อื่นๆ",
};

const USER_REPORT_TYPE_MAP = {
  FAKE_PROFILE: "โปรไฟล์ปลอม",
  HARASSMENT: "การกลั่นแกล้ง การคุกคาม หรือการแสดงความเกลียดชัง",
  VIOLENCE: "เนื้อหาเกี่ยวกับความรุนแรง หรือการทำร้ายตัวเอง",
  INFRINGEMENT: "การละเมิดทรัพย์สินทางปัญญา",
  ADULT: "เนื้อหาสำหรับผู้ใหญ่",
  OTHER: "อื่นๆ",
};

const reportConfig = {
  posts: {
    targetKey: "post_id",
    responseTable: "posts",
    typeMap: POST_SHEET_REPORT_TYPE_MAP,
  },
  sheets: {
    targetKey: "sheet_id",
    responseTable: "sheets",
    typeMap: POST_SHEET_REPORT_TYPE_MAP,
  },
  users: {
    targetKey: "user_id",
    responseTable: "users",
    typeMap: USER_REPORT_TYPE_MAP,
  },
};

const mapReportResponse = (row, referenceTable, originalType) => {
  const report = toPlain(row);
  const targetKey = reportConfig[referenceTable].targetKey;
  return {
    id: report.id,
    reference_id: report[targetKey],
    reference_table: referenceTable,
    report_type: originalType || report.report_type,
    mapped_report_type: report.report_type,
    content: report.content,
    status_flag: report.status_flag,
    created_at: report.created_at,
  };
};

export const service = {
  async submit(req) {
    const transaction = await sequelize.transaction();
    try {
      const { reference_id, reference_table, report_type, content } = req.body;
      const normalizedTable = String(reference_table || "").toLowerCase();
      const config = reportConfig[normalizedTable];

      if (!reference_id || !config || !report_type) {
        await transaction.rollback();
        return responseTemplates.setBadRequestResponse(RESPONSE_MESSAGES.BAD_REQUEST);
      }

      const mappedType = config.typeMap[report_type] || report_type;
      if (!Object.values(config.typeMap).includes(mappedType)) {
        await transaction.rollback();
        return responseTemplates.setBadRequestResponse(
          message("ประเภทการรายงานไม่ถูกต้อง", "Invalid report type."),
        );
      }

      const target = await reportsRepository.findVisibleTargetByTable(
        normalizedTable,
        reference_id,
        transaction,
      );

      if (!target) {
        await transaction.rollback();
        return responseTemplates.setNotFoundResponse(
          RESPONSE_MESSAGES.DATA_NOT_FOUND,
        );
      }

      const existing = await reportsRepository.findExistingReport(
        normalizedTable,
        reference_id,
        req.user.id,
        transaction,
      );

      if (existing) {
        await transaction.rollback();
        return responseTemplates.setConflictResponse(
          message("คุณได้รายงานรายการนี้แล้ว", "You have already reported this item."),
        );
      }

      const report = await reportsRepository.createReport(
        normalizedTable,
        {
          [config.targetKey]: reference_id,
          reporter_id: req.user.id,
          report_type: mappedType,
          content: content || null,
          status_flag: "PENDING",
          created_by: req.user.id,
        },
        transaction,
      );

      await transaction.commit();
      return responseTemplates.setCreatedResponse({
        report: mapReportResponse(report, normalizedTable, report_type),
      });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  },
};

export { reportConfig, mapReportResponse };
