import { ValidationError } from "sequelize";
import { HTTP_STATUS } from "../constants/http_status.constants.js";
import { models as sequelize } from "../models/sequelize/associations.js";
import { responseRepository } from "../utils/response.utils.js";

export const repository = {
  async createSheet(author_id, title, description, course, price, transaction) {
    try {
      const result = await sequelize.Sheets.create(
        {
          author_id,
          title,
          description,
          course,
          price,
        },
        { transaction }
      );

      if (result === null) {
        return responseRepository.setResult(HTTP_STATUS.FAILED, null);
      }

      return responseRepository.setResult(HTTP_STATUS.CREATED, result.dataValues);
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
        include:[
          {
            model: sequelize.Keywords,
            as: "keywords",
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
  }
};
