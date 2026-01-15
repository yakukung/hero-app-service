import { sequelize } from "../configs/sequelize.configs.js";
import { repository as categoriesRepository } from "../repositories/categories.repositories.js";
import { RESPONSE_MESSAGES } from "../constants/response.constant.js";
import { HTTP_STATUS } from "../constants/http_status.constants.js";
import { responseTemplates } from "../utils/response.utils.js";
import { mapping as categoriesMapping } from "../models/mapping/categories.mapping.js";

export const service = {
  async getAll(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const result = await categoriesRepository.findAll(transaction);
      switch (result.code) {
        case HTTP_STATUS.OK.code:
          break;
        default:
          return responseTemplates.setInternalServerErrorResponse(
            RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR
          );
      }

      await transaction.commit();
      const mapData = await categoriesMapping.mapCategories(
        result.result.data,
        result.result.count
      );
      return responseTemplates.setOKResponse(mapData);
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR
      );
    }
  },
  async getById(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const findCategoryById = await categoriesRepository.findById(
        id,
        transaction
      );
      switch (findCategoryById.code) {
        case HTTP_STATUS.OK.code:
          break;
        case HTTP_STATUS.NOT_FOUND.code:
          return responseTemplates.setNotFoundResponse(
            RESPONSE_MESSAGES.DATA_NOT_FOUND
          );
        default:
          return responseTemplates.setInternalServerErrorResponse(
            RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR
          );
      }

      await transaction.commit();
      const mapData = await categoriesMapping.mapCategory(
        findCategoryById.result
      );
      return responseTemplates.setOKResponse(mapData);
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR
      );
    }
  },
};
