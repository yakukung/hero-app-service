import { HTTP_STATUS } from "../constants/http_status.constants.js";
import { models as sequelize } from "../models/sequelize/associations.js";
import { responseRepository } from "../utils/response.utils.js";

export const repository = {
  async createSheetKeyword(sheet_id, keyword_id, transaction) {
    try {
      const result = await sequelize.SheetsKeywords.create(
        { sheet_id, keyword_id },
        { transaction }
      );
      
      return responseRepository.setResult(HTTP_STATUS.CREATED, result);
    } catch (error) {
      console.log(error);
      return responseRepository.setResult(HTTP_STATUS.INTERNAL_SERVER_ERROR, null);
    }
  }
};
