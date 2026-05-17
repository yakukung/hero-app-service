import { Op } from "sequelize";
import { models } from "../models/sequelize/associations.js";

const visibleWhereByUser = (userId) => ({
  user_id: userId,
  visible_flag: {
    [Op.ne]: false,
  },
});

export const repository = {
  async findWalletTopupsByUser(userId) {
    return models.WalletTopups.findAll({
      where: visibleWhereByUser(userId),
    });
  },

  async findPlanPaymentsByUser(userId) {
    return models.BuyPlans.findAll({
      where: visibleWhereByUser(userId),
      include: [{ model: models.Plans, as: "plan" }],
    });
  },

  async findSheetPaymentsByUser(userId) {
    return models.BuySheets.findAll({
      where: visibleWhereByUser(userId),
      include: [{ model: models.Sheets, as: "sheet" }],
    });
  },
};
