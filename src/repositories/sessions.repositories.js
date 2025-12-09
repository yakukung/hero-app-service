import { ValidationError } from "sequelize";
import { HTTP_STATUS } from "../constants/http_status.constants.js";
import { models as sequelize } from "../models/sequelize/associations.js";
import { responseRepository } from "../utils/response.utils.js";

export const repository = {
  async createSession(refreshToken, userId, useragent, expires_at, transaction) {
    try {
      const result = await sequelize.Sessions.create({
        user_id: userId,
        refresh_token: refreshToken,
        issued_at: new Date(),
        expires_at: expires_at,
        ip_address: null,
        user_agent: useragent,

      }, { transaction });

      if (result === null) {
        return responseRepository.setResult(HTTP_STATUS.FAILED, null);
      }

      return responseRepository.setResult(HTTP_STATUS.CREATED, result);
    } catch (error) {
      console.log(error);
      return responseRepository.setResult(HTTP_STATUS.INTERNAL_SERVER_ERROR, null);
    }
  },
};
