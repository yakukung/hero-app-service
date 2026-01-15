import { ValidationError } from "sequelize";
import { HTTP_STATUS } from "../constants/http_status.constants.js";
import { models as sequelize } from "../models/sequelize/associations.js";
import { responseRepository } from "../utils/response.utils.js";

export const repository = {
  async createSheet(author_id, title, description, price, transaction) {
    try {
      const result = await sequelize.Sheets.create(
        {
          author_id,
          title,
          description,
          price,
        },
        { transaction }
      );

      if (result === null) {
        return responseRepository.setResult(HTTP_STATUS.FAILED, null);
      }

      return responseRepository.setResult(
        HTTP_STATUS.CREATED,
        result.dataValues
      );
    } catch (error) {
      console.log(error);
      return responseRepository.setResult(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        null
      );
    }
  },
  async findById(id, transaction) {
    try {
      const result = await sequelize.Sheets.findOne({
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
        where: { id },
        transaction,
      });

      if (result === null) {
        return responseRepository.setResult(HTTP_STATUS.NOT_FOUND, null);
      }

      return responseRepository.setResult(HTTP_STATUS.OK, result.dataValues);
    } catch (error) {
      console.log(error);
      return responseRepository.setResult(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        null
      );
    }
  },
  async findAll(transaction) {
    try {
      const rows = await sequelize.Sheets.findAndCountAll({
        distinct: true,
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
        null
      );
    }
  },
};
