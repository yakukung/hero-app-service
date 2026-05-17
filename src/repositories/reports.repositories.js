import { Op } from "sequelize";
import { models } from "../models/sequelize/associations.js";

const reportTargets = {
  posts: {
    reportModel: models.ReportPosts,
    targetModel: models.Posts,
    targetKey: "post_id",
  },
  sheets: {
    reportModel: models.ReportSheets,
    targetModel: models.Sheets,
    targetKey: "sheet_id",
  },
  users: {
    reportModel: models.ReportUsers,
    targetModel: models.Users,
    targetKey: "user_id",
  },
};

const getConfig = (referenceTable) =>
  reportTargets[String(referenceTable || "").toLowerCase()] || null;

export const repository = {
  getConfig,

  async findVisibleTargetByTable(referenceTable, referenceId, transaction) {
    const config = getConfig(referenceTable);
    if (!config) return null;

    return config.targetModel.findOne({
      attributes: ["id"],
      where: {
        id: referenceId,
        visible_flag: {
          [Op.ne]: false,
        },
      },
      transaction,
    });
  },

  async findExistingReport(referenceTable, referenceId, reporterId, transaction) {
    const config = getConfig(referenceTable);
    if (!config) return null;

    return config.reportModel.findOne({
      where: {
        [config.targetKey]: referenceId,
        reporter_id: reporterId,
        visible_flag: {
          [Op.ne]: false,
        },
      },
      transaction,
    });
  },

  async createReport(referenceTable, payload, transaction) {
    const config = getConfig(referenceTable);
    if (!config) return null;

    return config.reportModel.create(payload, { transaction });
  },
};
