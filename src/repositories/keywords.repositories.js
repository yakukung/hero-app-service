import { HTTP_STATUS } from "../constants/http_status.constants.js";
import { models as sequelize } from "../models/sequelize/associations.js";
import { responseRepository } from "../utils/response.utils.js";

export const repository = {
  async create(sheet_id, name, transaction) {
    try {
      const result = await sequelize.Keywords.create(
        { sheet_id, name },
        { transaction },
      );

      if (!result) {
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
};
