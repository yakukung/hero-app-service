import { HTTP_STATUS } from "../constants/http_status.constants.js";
import { models as sequelize } from "../models/sequelize/associations.js";
import { responseRepository } from "../utils/response.utils.js";

export const repository = {
  async findUserByToken(sub, access_token, transaction) {
    try {
      const result = await sequelize.Users.findOne({
        where: { id: sub },
        include: {
          model: sequelize.Sessions,
          as: "sessions",
          include: {
            model: sequelize.Tokens,
            as: "tokens",
            where: {
              access_token: access_token,
            },
          },
        },
      }, { transaction });
      
      if (result === null) {
        return responseRepository.setResult(HTTP_STATUS.NOT_FOUND, null);
      }
      
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
