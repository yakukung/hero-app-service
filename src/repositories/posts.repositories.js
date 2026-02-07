import { HTTP_STATUS } from "../constants/http_status.constants.js";
import { models as sequelize } from "../models/sequelize/associations.js";
import { responseRepository } from "../utils/response.utils.js";

export const repository = {
  async findById(id, transaction) {
    console.log("🚀 ~ id:", id);
    try {
      const result = await sequelize.Posts.findOne({
        include: [
          {
            model: sequelize.Users,
            as: "author",
          },
          {
            model: sequelize.Sheets,
            as: "sheet",
          },
        ],
        where: { id },
        transaction,
      });
      if (result === null) {
        return responseRepository.setResult(HTTP_STATUS.NOT_FOUND, null);
      }

      return responseRepository.setResult(HTTP_STATUS.OK, result);
    } catch (error) {
      console.log(error);
      return responseRepository.setResult(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        null,
      );
    }
  },

  async create(data, transaction) {
    try {
      const result = await sequelize.Posts.create(data, { transaction });

      if (!result) {
        return responseRepository.setResult(HTTP_STATUS.FAILED, null);
      }

      return responseRepository.setResult(
        HTTP_STATUS.CREATED,
        result.dataValues,
      );
    } catch (error) {
      console.error(error);
      return responseRepository.setResult(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        null,
      );
    }
  },
};
