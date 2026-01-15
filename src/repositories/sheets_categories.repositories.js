import { ValidationError } from "sequelize";
import { HTTP_STATUS } from "../constants/http_status.constants.js";
import { models as sequelize } from "../models/sequelize/associations.js";
import { literal } from "sequelize";
import { responseRepository } from "../utils/response.utils.js";

export const repository = {
  async create(sheet_id, category_id, transaction) {
    try {
      const result = await sequelize.SheetsCategories.create(
        { sheet_id, category_id },
        { transaction }
      );

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
};
