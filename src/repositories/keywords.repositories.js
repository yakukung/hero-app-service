import { ValidationError } from "sequelize";
import { HTTP_STATUS } from "../constants/http_status.constants.js";
import { models as sequelize } from "../models/sequelize/associations.js";
import { literal } from "sequelize";
import { responseRepository } from "../utils/response.utils.js";

export const repository = {
  async findByKeyword(keyword, transaction) {
    try {
      const result = await sequelize.Keywords.findOne({
        where: { name: keyword },
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
  async createKeyword(keyword, transaction) {
    try {
      const result = await sequelize.Keywords.create(
        { name: keyword },
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
  async updateUsageCount(id, transaction) {
    try {
      const result = await sequelize.Keywords.update(
        { usage_count: literal("usage_count + 1") },
        {
          where: { id },
          transaction,
        }
      );

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
