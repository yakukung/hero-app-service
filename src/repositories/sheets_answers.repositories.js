import { ValidationError } from "sequelize";
import { HTTP_STATUS } from "../constants/http_status.constants.js";
import { models as sequelize } from "../models/sequelize/associations.js";
import { literal } from "sequelize";
import { responseRepository } from "../utils/response.utils.js";

export const repository = {
  async create(question_id, index, answer_text, is_correct, transaction) {
    try {
      const result = await sequelize.SheetsAnswers.create(
        { question_id, index, answer_text, is_correct },
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
