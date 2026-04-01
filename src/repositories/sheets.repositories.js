import { Op } from "sequelize";
import { HTTP_STATUS } from "../constants/http_status.constants.js";
import { STATUS_FLAG } from "../constants/status_flag.constants.js";
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
        { transaction },
      );

      if (result === null) {
        return responseRepository.setResult(HTTP_STATUS.BAD_REQUEST, null);
      }

      return responseRepository.setResult(
        HTTP_STATUS.CREATED,
        result.dataValues,
      );
    } catch (error) {
      console.log(error);
      return responseRepository.setResult(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        null,
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
          {
            model: sequelize.BuySheets,
            as: "payments",
            required: false,
            where: {
              payment_status: "SUCCESSFUL",
            },
            include: [
              {
                model: sequelize.Users,
                as: "user",
              },
            ],
          },
        ],
        where: {
          id,
          visible_flag: {
            [Op.ne]: false,
          },
        },
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
        null,
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
          {
            model: sequelize.BuySheets,
            as: "payments",
            required: false,
            where: {
              payment_status: "SUCCESSFUL",
            },
            include: [
              {
                model: sequelize.Users,
                as: "user",
              },
            ],
          },
        ],
        where: {
          visible_flag: {
            [Op.ne]: false,
          },
        },
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
  async findAllByAuthorId(user_id, transaction) {
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
          {
            model: sequelize.BuySheets,
            as: "payments",
            required: false,
            where: {
              payment_status: "SUCCESSFUL",
            },
            include: [
              {
                model: sequelize.Users,
                as: "user",
              },
            ],
          },
        ],
        where: {
          author_id: user_id,
          visible_flag: {
            [Op.ne]: false,
          },
        },
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
  async softDeleteById(id, user_id, transaction) {
    try {
      const sheet = await sequelize.Sheets.findOne({
        attributes: ["id"],
        where: {
          id,
          author_id: user_id,
          visible_flag: {
            [Op.ne]: false,
          },
        },
        transaction,
      });

      if (sheet === null) {
        return responseRepository.setResult(HTTP_STATUS.NOT_FOUND, null);
      }

      const purchasedCount = await sequelize.BuySheets.count({
        where: {
          sheet_id: id,
          payment_status: "SUCCESSFUL",
          visible_flag: {
            [Op.ne]: false,
          },
        },
        transaction,
      });

      if (purchasedCount > 0) {
        return responseRepository.setResult(HTTP_STATUS.CONFLICT, null);
      }

      const [affectedRows] = await sequelize.Sheets.update(
        {
          visible_flag: false,
          status_flag: STATUS_FLAG.INACTIVE,
          status_modified_at: new Date(),
          updated_at: new Date(),
          updated_by: user_id,
        },
        {
          where: {
            id,
            author_id: user_id,
            visible_flag: {
              [Op.ne]: false,
            },
          },
          transaction,
        },
      );

      if (affectedRows === 0) {
        return responseRepository.setResult(HTTP_STATUS.NOT_FOUND, null);
      }

      return responseRepository.setResult(HTTP_STATUS.OK, affectedRows);
    } catch (error) {
      console.log(error);
      return responseRepository.setResult(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        null,
      );
    }
  },
};
