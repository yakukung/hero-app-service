import { HTTP_STATUS } from "../constants/http_status.constants.js";
import { models as sequelize } from "../models/sequelize/associations.js";
import { responseRepository } from "../utils/response.utils.js";

export const repository = {
  async findByProviderUserId(provider_name, provider_user_id, transaction) {
    try {
      const result = await sequelize.UserProviders.findOne({
        where: {
          provider_name,
          provider_user_id,
        },
        include: [
          {
            model: sequelize.Users,
            as: "user",
            include: [
              {
                model: sequelize.Roles,
                as: "roles",
              },
            ],
          },
        ],
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

  async createUserProvider(
    user_id,
    provider_name,
    provider_user_id,
    provider_email,
    provider_username,
    transaction,
  ) {
    try {
      const result = await sequelize.UserProviders.create(
        {
          user_id,
          provider_name,
          provider_user_id,
          provider_email,
          provider_username,
        },
        { transaction },
      );

      if (result === null) {
        return responseRepository.setResult(HTTP_STATUS.BAD_REQUEST, null);
      }

      return responseRepository.setResult(HTTP_STATUS.CREATED, result);
    } catch (error) {
      console.log(error);
      return responseRepository.setResult(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        null,
      );
    }
  },
};
