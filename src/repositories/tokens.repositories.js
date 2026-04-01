import { ValidationError } from "sequelize";
import { HTTP_STATUS } from "../constants/http_status.constants.js";
import { models as sequelize } from "../models/sequelize/associations.js";
import { responseRepository } from "../utils/response.utils.js";

export const repository = {
  async createToken(token, sessionId, expires_at, transaction) {
    try {
      const result = await sequelize.Tokens.create({
        access_token: token,
        session_id: sessionId,
        issued_at: new Date(),
        expires_at: expires_at,

      }, { transaction });

      if (result === null) {
        return responseRepository.setResult(HTTP_STATUS.BAD_REQUEST, null);
      }

      return responseRepository.setResult(HTTP_STATUS.CREATED, result);
    } catch (error) {
      console.log(error);
      return responseRepository.setResult(HTTP_STATUS.INTERNAL_SERVER_ERROR, null);
    }
  },
};
