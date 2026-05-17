import { Op } from "sequelize";
import { models } from "../models/sequelize/associations.js";

const reportTargets = {
  posts: {
    reportModel: models.ReportPosts,
    targetModel: models.Posts,
    reportKey: "post_id",
  },
  sheets: {
    reportModel: models.ReportSheets,
    targetModel: models.Sheets,
    reportKey: "sheet_id",
  },
  users: {
    reportModel: models.ReportUsers,
    targetModel: models.Users,
    reportKey: "user_id",
  },
};

const getReportTarget = (referenceTable) =>
  reportTargets[String(referenceTable || "").toLowerCase()] || null;

export const repository = {
  getReportTarget,

  async findAllWalletTopupsWithUsers() {
    return models.WalletTopups.findAll({
      include: [
        {
          model: models.Users,
          as: "user",
          attributes: ["id", "username", "email"],
        },
      ],
    });
  },

  async findAllBuyPlansWithUsersAndPlan() {
    return models.BuyPlans.findAll({
      include: [
        {
          model: models.Users,
          as: "user",
          attributes: ["id", "username", "email"],
        },
        { model: models.Plans, as: "plan" },
      ],
    });
  },

  async findAllBuySheetsWithUsersAndSheet() {
    return models.BuySheets.findAll({
      include: [
        {
          model: models.Users,
          as: "user",
          attributes: ["id", "username", "email"],
        },
        { model: models.Sheets, as: "sheet" },
      ],
    });
  },

  async findWalletTopupByIdForUpdate(id, transaction) {
    return models.WalletTopups.findOne({
      where: { id },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
  },

  async updateWalletTopup(topUp, payload, transaction) {
    return topUp.update(payload, { transaction });
  },

  async findUserByIdForUpdate(id, transaction) {
    return models.Users.findOne({
      where: { id },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
  },

  async updateUser(user, payload, transaction) {
    return user.update(payload, { transaction });
  },

  async findBuyPlanByIdForUpdate(id, transaction) {
    return models.BuyPlans.findOne({
      where: { id },
      include: [{ model: models.Plans, as: "plan" }],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
  },

  async updateBuyPlan(payment, payload, transaction) {
    return payment.update(payload, { transaction });
  },

  async updateBuySheetById(id, payload) {
    return models.BuySheets.update(payload, {
      where: { id },
    });
  },

  async findAllBuyPlanPayments() {
    return models.BuyPlans.findAll({
      include: [
        {
          model: models.Users,
          as: "user",
          attributes: ["id", "username", "email"],
        },
        { model: models.Plans, as: "plan" },
      ],
      order: [["created_at", "DESC"]],
    });
  },

  async findAllSheetsForAdmin() {
    return models.Sheets.findAll({
      include: [
        {
          model: models.Users,
          as: "author",
          attributes: ["id", "username"],
        },
        {
          model: models.BuySheets,
          as: "payments",
          required: false,
          where: {
            payment_status: "SUCCESSFUL",
          },
          attributes: ["id", "user_id", "sheet_id", "payment_status"],
        },
      ],
      order: [["created_at", "DESC"]],
    });
  },

  async findAllActiveSubscriptions() {
    return models.UsersPlans.findAll({
      where: {
        visible_flag: {
          [Op.ne]: false,
        },
      },
      include: [
        {
          model: models.Users,
          as: "user",
          attributes: ["id", "username", "email"],
        },
        { model: models.Plans, as: "plan" },
      ],
      order: [["expires_at", "DESC"]],
    });
  },

  async findAllPostReports() {
    return models.ReportPosts.findAll({
      include: [
        {
          model: models.Users,
          as: "reporter",
          attributes: ["id", "username"],
        },
      ],
      order: [["created_at", "DESC"]],
    });
  },

  async findAllSheetReports() {
    return models.ReportSheets.findAll({
      include: [
        {
          model: models.Users,
          as: "reporter",
          attributes: ["id", "username"],
        },
      ],
      order: [["created_at", "DESC"]],
    });
  },

  async findAllUserReports() {
    return models.ReportUsers.findAll({
      include: [
        {
          model: models.Users,
          as: "reporter",
          attributes: ["id", "username"],
        },
      ],
      order: [["created_at", "DESC"]],
    });
  },

  async updateReportStatusByTable(referenceTable, id, payload) {
    const config = getReportTarget(referenceTable);
    if (!config) return [0];

    return config.reportModel.update(payload, {
      where: { id },
    });
  },

  async findReportByTableAndId(referenceTable, id, transaction) {
    const config = getReportTarget(referenceTable);
    if (!config) return null;

    return config.reportModel.findOne({
      where: { id },
      transaction,
    });
  },

  async updateTargetByTable(referenceTable, targetId, payload, transaction) {
    const config = getReportTarget(referenceTable);
    if (!config) return [0];

    return config.targetModel.update(payload, {
      where: { id: targetId },
      transaction,
    });
  },

  async updateReport(report, payload, transaction) {
    return report.update(payload, { transaction });
  },

  async updatePostById(id, payload) {
    return models.Posts.update(payload, {
      where: { id },
    });
  },

  async updateSheetById(id, payload) {
    return models.Sheets.update(payload, {
      where: { id },
    });
  },

  async updatePostCommentById(id, payload) {
    return models.PostsComments.update(payload, {
      where: { id },
    });
  },
};
