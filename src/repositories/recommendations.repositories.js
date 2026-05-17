import { Op } from "sequelize";
import { models } from "../models/sequelize/associations.js";

export const repository = {
  async findUserByIdWithKeywords(userId) {
    return models.Users.findOne({
      attributes: ["id", "keyword"],
      where: { id: userId },
    });
  },

  async findRecommendedSheets(limit) {
    return models.Sheets.findAll({
      where: {
        visible_flag: {
          [Op.ne]: false,
        },
        status_flag: "ACTIVE",
      },
      include: [
        { model: models.Users, as: "author", attributes: ["id", "username"] },
        { model: models.Keywords, as: "keywords" },
        {
          model: models.BuySheets,
          as: "payments",
          required: false,
          where: { payment_status: "SUCCESSFUL" },
        },
        {
          model: models.UsersSheetsFavorites,
          as: "favoriteEntries",
          required: false,
        },
        {
          model: models.SheetsReviews,
          as: "reviews",
          required: false,
          where: {
            visible_flag: {
              [Op.ne]: false,
            },
            status_flag: "ACTIVE",
          },
        },
      ],
      order: [["created_at", "DESC"]],
      limit,
    });
  },
};
