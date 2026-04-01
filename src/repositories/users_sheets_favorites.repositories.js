import { HTTP_STATUS } from "../constants/http_status.constants.js";
import { Op } from "sequelize";
import { models as sequelize } from "../models/sequelize/associations.js";
import { responseRepository } from "../utils/response.utils.js";

export const repository = {
  async getFavorites(user_id, transaction) {
    try {
      const rows = await sequelize.UsersSheetsFavorites.findAndCountAll({
        include: [
          {
            model: sequelize.Sheets,
            as: "sheet",
            required: true,
            where: {
              visible_flag: {
                [Op.ne]: false,
              },
            },
            include: [
              {
                model: sequelize.Keywords,
                as: "keywords",
              },
              {
                model: sequelize.SheetsQuestions,
                as: "questions",
                include: [
                  {
                    model: sequelize.SheetsAnswers,
                    as: "answers",
                  },
                ],
              },
              {
                model: sequelize.Categories,
                as: "categories",
              },
              {
                model: sequelize.SheetsFiles,
                as: "files",
              },
              {
                model: sequelize.Users,
                as: "author",
              },
            ],
          },
        ],
        where: { user_id },
        distinct: true,
        transaction,
      });
      if (rows.rows.length === 0) {
        return responseRepository.setResult(HTTP_STATUS.NOT_FOUND, null);
      }
      const result = {
        count: rows.count,
        data: rows.rows,
      };
      return responseRepository.setResult(HTTP_STATUS.OK, result);
    } catch (error) {
      console.log(error);
      return responseRepository.setResult(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        null,
      );
    }
  },
  async create(user_id, sheet_id, transaction) {
    try {
      const result = await sequelize.UsersSheetsFavorites.create(
        { user_id, sheet_id },
        { transaction },
      );
      if (result === null) {
        return responseRepository.setResult(HTTP_STATUS.BAD_REQUEST, null);
      }

      return responseRepository.setResult(HTTP_STATUS.CREATED, result);
    } catch (error) {
      console.log(error);
      return responseRepository.setResult(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        null,
      );
    }
  },

  async delete(user_id, sheet_id, transaction) {
    try {
      const result = await sequelize.UsersSheetsFavorites.destroy({
        where: { user_id, sheet_id },
        transaction,
      });
      if (result === 0) {
        return responseRepository.setResult(HTTP_STATUS.NOT_FOUND, null);
      }

      return responseRepository.setResult(HTTP_STATUS.OK, result);
    } catch (error) {
      console.log(error);
      return responseRepository.setResult(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        null,
      );
    }
  },
};
