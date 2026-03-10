import { HTTP_STATUS } from "../constants/http_status.constants.js";
import { models as sequelize } from "../models/sequelize/associations.js";
import { responseRepository } from "../utils/response.utils.js";

export const repository = {
  async findFollow(follower_id, following_id, transaction) {
    try {
      const result = await sequelize.UsersFollows.findOne({
        where: { follower_id, following_id },
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

  async create(follower_id, following_id, transaction) {
    try {
      const result = await sequelize.UsersFollows.create(
        { follower_id, following_id },
        { transaction },
      );

      if (result === null) {
        return responseRepository.setResult(HTTP_STATUS.FAILED, null);
      }

      return responseRepository.setResult(HTTP_STATUS.CREATED, result);
    } catch (error) {
      if (error?.name === "SequelizeUniqueConstraintError") {
        return responseRepository.setResult(HTTP_STATUS.CONFLICT, null);
      }
      if (error?.name === "SequelizeValidationError") {
        return responseRepository.setResult(HTTP_STATUS.FAILED, null);
      }
      console.log(error);
      return responseRepository.setResult(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        null,
      );
    }
  },

  async delete(follower_id, following_id, transaction) {
    try {
      const result = await sequelize.UsersFollows.destroy({
        where: { follower_id, following_id },
        transaction,
      });

      if (result === 0) {
        return responseRepository.setResult(HTTP_STATUS.NOT_FOUND, null);
      }

      return responseRepository.setResult(HTTP_STATUS.OK, null);
    } catch (error) {
      console.log(error);
      return responseRepository.setResult(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        null,
      );
    }
  },
};
