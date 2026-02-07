import bcrypt from "bcrypt";
import fs from "fs";
import { sequelize } from "../configs/sequelize.configs.js";
import { repository as usersRepository } from "../repositories/users.repositories.js";
import { repository as rolesRepository } from "../repositories/roles.repositories.js";
import { repository as sessionsRepository } from "../repositories/sessions.repositories.js";
import { repository as tokensRepository } from "../repositories/tokens.repositories.js";
import { RESPONSE_MESSAGES } from "../constants/response.constant.js";
import { HTTP_STATUS } from "../constants/http_status.constants.js";
import { responseTemplates } from "../utils/response.utils.js";
import { mapping as usersMapping } from "../models/mapping/users.mapping.js";
import { STATUS_FLAG } from "../constants/status_flag.constants.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/jwt.utils.js";
import {
  accessTokenExpireMs,
  refreshTokenExpireMs,
} from "../utils/timeConverter.utils.js";

export const service = {
  async getById(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const findUserById = await usersRepository.findById(id, transaction);
      switch (findUserById.code) {
        case HTTP_STATUS.OK.code:
          break;
        case HTTP_STATUS.NOT_FOUND.code:
          await transaction.rollback();
          return responseTemplates.setNotFoundResponse(
            RESPONSE_MESSAGES.DATA_NOT_FOUND,
          );
        default:
          await transaction.rollback();
          return responseTemplates.setInternalServerErrorResponse(
            RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
          );
      }

      await transaction.commit();
      const mapData = await usersMapping.mapUser(findUserById.result);
      return responseTemplates.setOKResponse(mapData);
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  },

  async updateProfileImage(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { uid } = req.body;
      let profile_image = null;

      if (req.file) {
        const user = await usersRepository.findById(uid, transaction);
        if (user.code === HTTP_STATUS.OK.code && user.result.profile_image) {
          if (fs.existsSync(user.result.profile_image)) {
            fs.unlinkSync(user.result.profile_image);
          }
        }
        profile_image = req.file.path;
      }
      const updateResult = await usersRepository.updateProfileImage(
        uid,
        profile_image,
        transaction,
      );

      if (updateResult.code !== HTTP_STATUS.OK.code) {
        await transaction.rollback();
        return responseTemplates.setInternalServerErrorResponse(
          RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        );
      }

      await transaction.commit();
      return responseTemplates.setNoContentResponse();
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  },

  async updateProfile(req, res) {
    const transaction = await sequelize.transaction();
    try {
      let { uid, username, password } = req.body;
      if (!username) username = undefined;
      if (!password) password = undefined;

      if (password) {
        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);
      }
      let profile_image = undefined;

      if (req.file) {
        const user = await usersRepository.findById(uid, transaction);
        if (user.code === HTTP_STATUS.OK.code && user.result.profile_image) {
          if (fs.existsSync(user.result.profile_image)) {
            fs.unlinkSync(user.result.profile_image);
          }
        }
        profile_image = req.file.path;
      }
      const updateResult = await usersRepository.updateProfile(
        uid,
        username,
        password,
        profile_image,
        transaction,
      );

      if (updateResult.code !== HTTP_STATUS.OK.code) {
        await transaction.rollback();
        return responseTemplates.setInternalServerErrorResponse(
          RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        );
      }

      await transaction.commit();
      return responseTemplates.setNoContentResponse();
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  },

  async updatePassword(req, res) {
    const transaction = await sequelize.transaction();
    try {
      let { uid, old_password, new_password } = req.body;

      const findUserById = await usersRepository.findById(uid, transaction);
      switch (findUserById.code) {
        case HTTP_STATUS.OK.code:
          break;
        case HTTP_STATUS.NOT_FOUND.code:
          await transaction.rollback();
          return responseTemplates.setNotFoundResponse(
            RESPONSE_MESSAGES.DATA_NOT_FOUND,
          );
        default:
          await transaction.rollback();
          return responseTemplates.setInternalServerErrorResponse(
            RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
          );
      }

      const comparePassword = await bcrypt.compare(
        old_password,
        findUserById.result.password.toString(),
      );
      if (!comparePassword) {
        await transaction.rollback();
        return responseTemplates.setUnauthorizedResponse(
          RESPONSE_MESSAGES.INVALID_OLD_PASSWORD,
        );
      }

      const salt = await bcrypt.genSalt(10);
      new_password = await bcrypt.hash(new_password, salt);

      const updateResult = await usersRepository.updatePassword(
        uid,
        new_password,
        transaction,
      );

      switch (updateResult.code) {
        case HTTP_STATUS.OK.code:
          break;
        case HTTP_STATUS.NOT_FOUND.code:
          await transaction.rollback();
          return responseTemplates.setNotFoundResponse(
            RESPONSE_MESSAGES.DATA_NOT_FOUND,
          );
        default:
          await transaction.rollback();
          return responseTemplates.setInternalServerErrorResponse(
            RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
          );
      }

      await transaction.commit();
      return responseTemplates.setNoContentResponse();
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  },
  async updateUsername(req, res) {
    const transaction = await sequelize.transaction();
    try {
      let { uid, username } = req.body;
      const findUserByUsername = await usersRepository.findByUsername(
        username,
        transaction,
      );
      switch (findUserByUsername.code) {
        case HTTP_STATUS.OK.code:
          await transaction.rollback();
          return responseTemplates.setConflictResponse(
            RESPONSE_MESSAGES.USERNAME_ALREADY_ERROR,
          );
        case HTTP_STATUS.NOT_FOUND.code:
          break;
        default:
          await transaction.rollback();
          return responseTemplates.setInternalServerErrorResponse(
            RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
          );
      }

      const updateResult = await usersRepository.updateUsername(
        uid,
        username,
        transaction,
      );

      switch (updateResult.code) {
        case HTTP_STATUS.OK.code:
          break;
        case HTTP_STATUS.NOT_FOUND.code:
          await transaction.rollback();
          return responseTemplates.setNotFoundResponse(
            RESPONSE_MESSAGES.DATA_NOT_FOUND,
          );
        default:
          await transaction.rollback();
          return responseTemplates.setInternalServerErrorResponse(
            RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
          );
      }

      await transaction.commit();
      return responseTemplates.setNoContentResponse();
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  },
  async updateEmail(req, res) {
    const transaction = await sequelize.transaction();
    try {
      let { uid, email, password } = req.body;

      const findUserById = await usersRepository.findById(uid, transaction);
      switch (findUserById.code) {
        case HTTP_STATUS.OK.code:
          break;
        case HTTP_STATUS.NOT_FOUND.code:
          await transaction.rollback();
          return responseTemplates.setNotFoundResponse(
            RESPONSE_MESSAGES.DATA_NOT_FOUND,
          );
        default:
          await transaction.rollback();
          return responseTemplates.setInternalServerErrorResponse(
            RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
          );
      }

      const storedPassword = findUserById.result.password.toString();

      if (!storedPassword) {
        await transaction.rollback();
        return responseTemplates.setUnauthorizedResponse(
          RESPONSE_MESSAGES.INVALID_PASSWORD,
        );
      }

      const isPasswordValid = await bcrypt.compare(password, storedPassword);

      if (!isPasswordValid) {
        await transaction.rollback();
        return responseTemplates.setUnauthorizedResponse(
          RESPONSE_MESSAGES.INVALID_PASSWORD,
        );
      }

      const updateResult = await usersRepository.updateEmail(
        uid,
        email,
        transaction,
      );

      switch (updateResult.code) {
        case HTTP_STATUS.OK.code:
          break;
        case HTTP_STATUS.NOT_FOUND.code:
          await transaction.rollback();
          return responseTemplates.setNotFoundResponse(
            RESPONSE_MESSAGES.DATA_NOT_FOUND,
          );
        default:
          await transaction.rollback();
          return responseTemplates.setInternalServerErrorResponse(
            RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
          );
      }

      await transaction.commit();
      return responseTemplates.setNoContentResponse();
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  },
};
