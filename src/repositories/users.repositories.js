import { ValidationError } from "sequelize";
import { HTTP_STATUS } from "../constants/http_status.constants.js";
import { models as sequelize } from "../models/sequelize/associations.js";
import { responseRepository } from "../utils/response.utils.js";

export const repository = {
  async findById(id, transaction) {
    try {
      const result = await sequelize.Users.findOne({
        where: { id },
        transaction,
      });

      if (result === null) {
        return responseRepository.setResult(HTTP_STATUS.NOT_FOUND, null);
      }

      return responseRepository.setResult(HTTP_STATUS.OK, result);
    } catch (error) {
      console.log(error);
      return responseRepository.setResult(HTTP_STATUS.SERVER_ERROR, null);
    }
  },
  async findByEmail(email, transaction) {
    try {
      const result = await sequelize.Users.findOne({
        where: { email },
        transaction,
      });

      if (result === null) {
        return responseRepository.setResult(HTTP_STATUS.NOT_FOUND, null);
      }

      return responseRepository.setResult(HTTP_STATUS.OK, result);
    } catch (error) {
      console.log(error);
      return responseRepository.setResult(HTTP_STATUS.SERVER_ERROR, null);
    }
  },

  async findByUsername(username, transaction) {
    try {
      const result = await sequelize.Users.findOne({
        where: { username },
        transaction,
      });

      if (result === null) {
        return responseRepository.setResult(HTTP_STATUS.NOT_FOUND, null);
      }

      return responseRepository.setResult(HTTP_STATUS.OK, result);
    } catch (error) {
      console.log(error);
      return responseRepository.setResult(HTTP_STATUS.SERVER_ERROR, null);
    }
  },

  async createUser(username, email, password, role_id, transaction) {
    try {
      const result = await sequelize.Users.create({
        username,
        email,
        password,
        role_id,
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
