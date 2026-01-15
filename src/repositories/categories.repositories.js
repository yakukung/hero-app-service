import { ValidationError } from "sequelize";
import { HTTP_STATUS } from "../constants/http_status.constants.js";
import { models as sequelize } from "../models/sequelize/associations.js";
import { literal } from "sequelize";
import { responseRepository } from "../utils/response.utils.js";

export const repository = {
  async findAll(transaction) {
    try {
      const rows = await sequelize.Categories.findAndCountAll({
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
  async findById(id, transaction) {
    try {
      const result = await sequelize.Categories.findOne({
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
};
