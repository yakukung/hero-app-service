import bcrypt from "bcrypt";
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
import { accessTokenExpireMs, refreshTokenExpireMs } from "../utils/timeConverter.utils.js";

export const service = {
  async register(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { username, email, password, confirmPassword } = req.body;

      const existingEmail = await usersRepository.findByEmail(
        email,
        transaction
      );
      switch (existingEmail.code) {
        case HTTP_STATUS.OK.code:
          return responseTemplates.setConflictResponse(
            RESPONSE_MESSAGES.EMAIL_ALREADY_ERROR
          );
        case HTTP_STATUS.NOT_FOUND.code:
          break;
        default:
          return responseTemplates.setInternalServerErrorResponse(
            RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR
          );
      }

      const existingUsername = await usersRepository.findByUsername(
        username,
        transaction
      );
      switch (existingUsername.code) {
        case HTTP_STATUS.OK.code:
          return responseTemplates.setConflictResponse(
            RESPONSE_MESSAGES.USERNAME_ALREADY_ERROR
          );
        case HTTP_STATUS.NOT_FOUND.code:
          break;
        default:
          return responseTemplates.setInternalServerErrorResponse(
            RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR
          );
      }

      if (password !== confirmPassword) {
        return responseTemplates.setFailedResponse(
          RESPONSE_MESSAGES.PASSWORD_NOT_MATCH_ERROR
        );
      }

      const findRole = await rolesRepository.findByName(
        process.env.DEFAULT_ROLE,
        transaction
      );
      switch (findRole.code) {
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

      if (password !== confirmPassword) {
        return responseTemplates.setFailedResponse(
          RESPONSE_MESSAGES.PASSWORD_NOT_MATCH_ERROR
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const createUser = await usersRepository.createUser(
        username,
        email,
        hashedPassword,
        findRole.result.id,
        transaction
      );
      switch (createUser.code) {
        case HTTP_STATUS.CREATED.code:
          break;
        case HTTP_STATUS.FAILED.code:
          return responseTemplates.setFailedResponse(RESPONSE_MESSAGES.FAILED);
        default:
          return responseTemplates.setInternalServerErrorResponse(
            RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR
          );
      }
      const findUserById = await usersRepository.findById(
        createUser.result.id,
        transaction
      );
      switch (findUserById.code) {
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
      const mapData = await usersMapping.mapUser(findUserById.result);
      return responseTemplates.setOKResponse(mapData);
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR
      );
    }
  },

  async login(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { usernameOrEmail, password } = req.body;
      let findUser = await usersRepository.findByUsername(
        usernameOrEmail,
        transaction
      );
      switch (findUser.code) {
        case HTTP_STATUS.OK.code:
          break;
        case HTTP_STATUS.NOT_FOUND.code:
          findUser = await usersRepository.findByEmail(
            usernameOrEmail,
            transaction
          );
          break;
        default:
          await transaction.rollback();
          return responseTemplates.setInternalServerErrorResponse(
            RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR
          );
      }

      if (!findUser || findUser.code === HTTP_STATUS.NOT_FOUND.code) {
        await transaction.rollback();
        return responseTemplates.setUnauthorizedResponse(
          RESPONSE_MESSAGES.AUTHENTICATION_INVALID_ERROR
        );
      }

      if (findUser.code !== HTTP_STATUS.OK.code) {
        await transaction.rollback();
        return responseTemplates.setInternalServerErrorResponse(
          RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR
        );
      }

      const user = findUser.result;
      const hashedPassword = user.password.toString();
      const isPasswordValid = await bcrypt.compare(password, hashedPassword);

      if (isPasswordValid === false) {
        await transaction.rollback();
        return responseTemplates.setUnauthorizedResponse(
          RESPONSE_MESSAGES.AUTHENTICATION_INVALID_ERROR
        );
      }

      if (user.status_flag !== STATUS_FLAG.ACTIVE) {
        await transaction.rollback();
        return responseTemplates.setUnauthorizedResponse(
          RESPONSE_MESSAGES.USER_NOT_ACTIVE_ERROR
        );
      }

      const accessToken = generateAccessToken(user.id, user.role_id);
      const refreshToken = generateRefreshToken(user.id);

      const createSession = await sessionsRepository.createSession(
        refreshToken,
        user.id,
        req.useragent,
        refreshTokenExpireMs()
      );

      const sessionId = createSession.result.id;
      await tokensRepository.createToken(
        accessToken,
        sessionId,
        accessTokenExpireMs()
      );

      const result = await usersRepository.findById(user.id, transaction);
      switch (result.code) {
        case HTTP_STATUS.OK.code:
          break;
        case HTTP_STATUS.NOT_FOUND.code:
          await transaction.rollback();
          return responseTemplates.setNotFoundResponse(
            RESPONSE_MESSAGES.DATA_NOT_FOUND
          );
        default:
          await transaction.rollback();
          return responseTemplates.setInternalServerErrorResponse(
            RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR
          );
      }
      const data = {
        result: result.result,
        accessToken: accessToken,
        refreshToken: refreshToken,
      }
      await transaction.commit();
      const mapData = await usersMapping.mapUserDetail(data);
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
