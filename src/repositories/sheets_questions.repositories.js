import { ValidationError } from "sequelize";
import { HTTP_STATUS } from "../constants/http_status.constants.js";
import { models as sequelize } from "../models/sequelize/associations.js";
import { literal } from "sequelize";
import { responseRepository } from "../utils/response.utils.js";

export const repository = {
  async create(sheet_id, index, question_text, explanation, transaction) {
    try {
      const result = await sequelize.SheetsQuestions.create(
        { sheet_id, index, question_text, explanation },
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
};
