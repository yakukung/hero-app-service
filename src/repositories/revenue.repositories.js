import { Op } from "sequelize";
import { models } from "../models/sequelize/associations.js";

export const repository = {
  async findCreatorRevenuePayments(userId, where) {
    return models.BuySheets.findAll({
      where,
      include: [
        {
          model: models.Sheets,
          as: "sheet",
          required: true,
          where: {
            author_id: userId,
            visible_flag: {
              [Op.ne]: false,
            },
          },
        },
        {
          model: models.Users,
          as: "user",
          attributes: ["id", "username"],
        },
      ],
      order: [["created_at", "DESC"]],
    });
  },

  async findAdminRevenuePayments(where) {
    return models.BuySheets.findAll({
      where,
      include: [
        {
          model: models.Sheets,
          as: "sheet",
          include: [
            {
              model: models.Users,
              as: "author",
              attributes: ["id", "username"],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });
  },
};
