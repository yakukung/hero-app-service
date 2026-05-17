import { Op } from "sequelize";
import { models } from "../models/sequelize/associations.js";

export const repository = {
  async findTopUpsByUser(userId) {
    return models.WalletTopups.findAll({
      where: {
        user_id: userId,
        visible_flag: {
          [Op.ne]: false,
        },
      },
      order: [["created_at", "DESC"]],
    });
  },

  async createTopUp(payload) {
    return models.WalletTopups.create(payload);
  },
};
