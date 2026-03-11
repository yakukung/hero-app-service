import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
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
import { AUTH_PROVIDER } from "../constants/auth_provider.constants.js";
import { repository as userProvidersRepository } from "../repositories/user_providers.repositories.js";
import { repository as walletsRepository } from "../repositories/wallets.repositories.js";
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
import { sendResetPasswordEmail, sendVerificationEmail } from "../utils/mail.utils.js";

export const service = {
  async register(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { username, email, password, confirmPassword, base_url } = req.body;

      const existingEmail = await usersRepository.findByEmail(
        email,
        transaction,
      );
      switch (existingEmail.code) {
        case HTTP_STATUS.OK.code:
          return responseTemplates.setConflictResponse(
            RESPONSE_MESSAGES.EMAIL_ALREADY_ERROR,
          );
        case HTTP_STATUS.NOT_FOUND.code:
          break;
        default:
          return responseTemplates.setInternalServerErrorResponse(
            RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
          );
      }
      const existingUsername = await usersRepository.findByUsername(
        username,
        transaction,
      );
      switch (existingUsername.code) {
        case HTTP_STATUS.OK.code:
          return responseTemplates.setConflictResponse(
            RESPONSE_MESSAGES.USERNAME_ALREADY_ERROR,
          );
        case HTTP_STATUS.NOT_FOUND.code:
          break;
        default:
          return responseTemplates.setInternalServerErrorResponse(
            RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
          );
      }
      if (password !== confirmPassword) {
        return responseTemplates.setFailedResponse(
          RESPONSE_MESSAGES.PASSWORD_NOT_MATCH_ERROR,
        );
      }
      const findRole = await rolesRepository.findByName(
        process.env.DEFAULT_ROLE,
        transaction,
      );
      switch (findRole.code) {
        case HTTP_STATUS.OK.code:
          break;
        case HTTP_STATUS.NOT_FOUND.code:
          return responseTemplates.setNotFoundResponse(
            RESPONSE_MESSAGES.DATA_NOT_FOUND,
          );
        default:
          return responseTemplates.setInternalServerErrorResponse(
            RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
          );
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const createUser = await usersRepository.createUser(
        username,
        email,
        hashedPassword,
        findRole.result.id,
        transaction,
      );
      switch (createUser.code) {
        case HTTP_STATUS.CREATED.code:
          break;
        case HTTP_STATUS.FAILED.code:
          return responseTemplates.setFailedResponse(RESPONSE_MESSAGES.FAILED);
        default:
          return responseTemplates.setInternalServerErrorResponse(
            RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
          );
      }
      const createWallet = await walletsRepository.createWallet(
        createUser.result.id,
        transaction,
      );
      switch (createWallet.code) {
        case HTTP_STATUS.CREATED.code:
          break;
        case HTTP_STATUS.FAILED.code:
          return responseTemplates.setFailedResponse(RESPONSE_MESSAGES.FAILED);
        default:
          return responseTemplates.setInternalServerErrorResponse(
            RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
          );
      }
      const findUserById = await usersRepository.findById(
        createUser.result.id,
        transaction,
      );
      switch (findUserById.code) {
        case HTTP_STATUS.OK.code:
          await sendVerificationEmail(email, findUserById.result.id, base_url);
          break;
        case HTTP_STATUS.NOT_FOUND.code:
          return responseTemplates.setNotFoundResponse(
            RESPONSE_MESSAGES.DATA_NOT_FOUND,
          );
        default:
          return responseTemplates.setInternalServerErrorResponse(
            RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
          );
      }
      await transaction.commit();
      const mapData = await usersMapping.mapUser(findUserById.result);
      return responseTemplates.setCreatedResponse(mapData);
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  },

  async verify(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const user_id = req.params.user_id;
      const findUserById = await usersRepository.findById(user_id, transaction);
      switch (findUserById.code) {
        case HTTP_STATUS.OK.code:
          break;
        case HTTP_STATUS.NOT_FOUND.code:
          return responseTemplates.setNotFoundResponse(
            RESPONSE_MESSAGES.DATA_NOT_FOUND,
          );
        default:
          return responseTemplates.setInternalServerErrorResponse(
            RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
          );
      }
      const updateStatusUser = await usersRepository.updateStatusUser(
        user_id,
        transaction,
      );
      switch (updateStatusUser.code) {
        case HTTP_STATUS.OK.code:
          break;
        case HTTP_STATUS.NOT_FOUND.code:
          return responseTemplates.setNotFoundResponse(
            RESPONSE_MESSAGES.DATA_NOT_FOUND,
          );
        default:
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
  async login(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { usernameOrEmail, password } = req.body;
      let findUser = await usersRepository.findByUsername(
        usernameOrEmail,
        transaction,
      );
      switch (findUser.code) {
        case HTTP_STATUS.OK.code:
          break;
        case HTTP_STATUS.NOT_FOUND.code:
          findUser = await usersRepository.findByEmail(
            usernameOrEmail,
            transaction,
          );
          break;
        default:
          await transaction.rollback();
          return responseTemplates.setInternalServerErrorResponse(
            RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
          );
      }

      if (!findUser || findUser.code === HTTP_STATUS.NOT_FOUND.code) {
        await transaction.rollback();
        return responseTemplates.setUnauthorizedResponse(
          RESPONSE_MESSAGES.AUTHENTICATION_INVALID_ERROR,
        );
      }

      if (findUser.code !== HTTP_STATUS.OK.code) {
        await transaction.rollback();
        return responseTemplates.setInternalServerErrorResponse(
          RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        );
      }

      const user = findUser.result;
      const hashedPassword = user.password.toString();
      const isPasswordValid = await bcrypt.compare(password, hashedPassword);

      if (isPasswordValid === false) {
        await transaction.rollback();
        return responseTemplates.setUnauthorizedResponse(
          RESPONSE_MESSAGES.AUTHENTICATION_INVALID_ERROR,
        );
      }

      switch (user.status_flag) {
        case STATUS_FLAG.PENDING:
          await transaction.rollback();
          return responseTemplates.setUnauthorizedResponse(
            RESPONSE_MESSAGES.USER_ACCOUNT_PENDING_ERROR,
          );
        case STATUS_FLAG.INACTIVE:
          const updateStatusUser = await usersRepository.updateStatusUser(
            user.id,
            transaction,
          );
          switch (updateStatusUser.code) {
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
        case STATUS_FLAG.SUSPENDED:
          await transaction.rollback();
          return responseTemplates.setUnauthorizedResponse(
            RESPONSE_MESSAGES.USER_ACCOUNT_SUSPENDED_ERROR,
          );
        case STATUS_FLAG.TERMINATED:
          await transaction.rollback();
          return responseTemplates.setUnauthorizedResponse(
            RESPONSE_MESSAGES.USER_ACCOUNT_TERMINATED_ERROR,
          );
        default:
          break;
      }

      const accessToken = generateAccessToken(user.id, user.role_id);
      const refreshToken = generateRefreshToken(user.id);
      const accessTokenExpiresAt = accessTokenExpireMs();
      const refreshTokenExpiresAt = refreshTokenExpireMs();

      const createSession = await sessionsRepository.createSession(
        refreshToken,
        user.id,
        req.useragent,
        refreshTokenExpireMs(),
      );

      const sessionId = createSession.result.id;
      await tokensRepository.createToken(
        accessToken,
        sessionId,
        accessTokenExpireMs(),
      );

      const result = await usersRepository.findById(user.id, transaction);
      switch (result.code) {
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
      const data = {
        result: result.result,
        accessToken: accessToken,
        refreshToken: refreshToken,
        accessTokenExpiresAt: accessTokenExpiresAt,
        refreshTokenExpiresAt: refreshTokenExpiresAt,
      };
      const mapData = await usersMapping.mapUserDetail(data);
      return responseTemplates.setOKResponse(mapData);
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  },
  async loginByGoogle(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const {
        provider_user_id,
        provider_name,
        provider_username,
        provider_email,
        provider_avatar,
      } = req.body;

      const findUserProvider =
        await userProvidersRepository.findByProviderUserId(
          provider_name,
          provider_user_id,
          transaction,
        );

      let user = null;

      switch (findUserProvider.code) {
        case HTTP_STATUS.OK.code:
          user = findUserProvider.result.user;
          break;
        case HTTP_STATUS.NOT_FOUND.code:
          const findRole = await rolesRepository.findByName(
            process.env.DEFAULT_ROLE,
            transaction,
          );

          switch (findRole.code) {
            case HTTP_STATUS.OK.code:
              break;
            default:
              await transaction.rollback();
              return responseTemplates.setNotFoundResponse(
                RESPONSE_MESSAGES.DATA_NOT_FOUND,
              );
          }

          let randomUsername = "";
          let isUnique = false;
          while (!isUnique) {
            const emailPrefix = provider_email.split("@")[0].substring(0, 20);
            const randomSuffix = crypto.randomBytes(4).toString("hex");
            randomUsername = `${emailPrefix}_${randomSuffix}`;

            const checkUsername = await usersRepository.findByUsername(
              randomUsername,
              transaction,
            );
            if (checkUsername.code === HTTP_STATUS.NOT_FOUND.code) {
              isUnique = true;
            }
          }

          const createUser = await usersRepository.createUserByProvider(
            provider_avatar,
            AUTH_PROVIDER.GOOGLE,
            findRole.result.id,
            STATUS_FLAG.ACTIVE,
            randomUsername,
            transaction,
          );

          switch (createUser.code) {
            case HTTP_STATUS.CREATED.code:
              user = createUser.result;
              break;
            default:
              await transaction.rollback();
              return responseTemplates.setFailedResponse(
                RESPONSE_MESSAGES.FAILED,
              );
          }

          const createProvider =
            await userProvidersRepository.createUserProvider(
              user.id,
              provider_name,
              provider_user_id,
              provider_email,
              provider_username,
              transaction,
            );

          switch (createProvider.code) {
            case HTTP_STATUS.CREATED.code:
              break;
            default:
              await transaction.rollback();
              return responseTemplates.setFailedResponse(
                RESPONSE_MESSAGES.FAILED,
              );
          }

          const createWallet = await walletsRepository.createWallet(
            createUser.result.id,
            transaction,
          );
          switch (createWallet.code) {
            case HTTP_STATUS.CREATED.code:
              break;
            case HTTP_STATUS.FAILED.code:
              return responseTemplates.setFailedResponse(
                RESPONSE_MESSAGES.FAILED,
              );
            default:
              return responseTemplates.setInternalServerErrorResponse(
                RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
              );
          }
          break;
        default:
          await transaction.rollback();
          return responseTemplates.setInternalServerErrorResponse(
            RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
          );
      }

      switch (user.status_flag) {
        case STATUS_FLAG.PENDING:
          await transaction.rollback();
          return responseTemplates.setUnauthorizedResponse(
            RESPONSE_MESSAGES.USER_ACCOUNT_PENDING_ERROR,
          );
        case STATUS_FLAG.INACTIVE:
          const updateStatusUser = await usersRepository.updateStatusUser(
            user.id,
            transaction,
          );
          switch (updateStatusUser.code) {
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
        case STATUS_FLAG.SUSPENDED:
          await transaction.rollback();
          return responseTemplates.setUnauthorizedResponse(
            RESPONSE_MESSAGES.USER_ACCOUNT_SUSPENDED_ERROR,
          );
        case STATUS_FLAG.TERMINATED:
          await transaction.rollback();
          return responseTemplates.setUnauthorizedResponse(
            RESPONSE_MESSAGES.USER_ACCOUNT_TERMINATED_ERROR,
          );
        default:
          break;
      }

      const accessToken = generateAccessToken(user.id, user.role_id);
      const refreshToken = generateRefreshToken(user.id);
      const accessTokenExpiresAt = accessTokenExpireMs();
      const refreshTokenExpiresAt = refreshTokenExpireMs();

      const createSession = await sessionsRepository.createSession(
        refreshToken,
        user.id,
        req.useragent,
        refreshTokenExpireMs(),
        transaction,
      );

      const sessionId = createSession.result.id;
      await tokensRepository.createToken(
        accessToken,
        sessionId,
        accessTokenExpireMs(),
        transaction,
      );

      const result = await usersRepository.findById(user.id, transaction);

      const data = {
        result: result.result,
        accessToken: accessToken,
        refreshToken: refreshToken,
        accessTokenExpiresAt: accessTokenExpiresAt,
        refreshTokenExpiresAt: refreshTokenExpiresAt,
      };

      await transaction.commit();
      const mapData = await usersMapping.mapUserDetail(data);
      return responseTemplates.setOKResponse(mapData);
    } catch (error) {
      await transaction.rollback();
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  },
  async forgotPassword(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { email, base_url } = req.body;
      const findUser = await usersRepository.findByEmail(email, transaction);
      switch (findUser.code) {
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

      const resetSecret =
        process.env.JWT_SECRET_RESET_PASSWORD ||
        process.env.JWT_SECRET_ACCESS_TOKEN;
      const resetExpiresIn =
        process.env.JWT_EXPIRE_RESET_PASSWORD || "15m";

      const resetToken = jwt.sign(
        {
          type: "reset_password",
          sub: findUser.result.id,
        },
        resetSecret,
        {
          algorithm: process.env.JWT_ALGORITHM,
          expiresIn: resetExpiresIn,
        },
      );

      const baseUrl =
        base_url || process.env.FRONTEND_URL || process.env.BASE_URL;
      const resetLink = `${baseUrl}/auth/reset-password?token=${encodeURIComponent(
        resetToken,
      )}`;

      await sendResetPasswordEmail(email, resetLink);

      await transaction.commit();
      return responseTemplates.setOKResponse({
        message: RESPONSE_MESSAGES.SUCCESS.message,
      });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  },
  async resetPassword(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { token, new_password, confirmPassword } = req.body;

      if (!token || !new_password) {
        await transaction.rollback();
        return responseTemplates.setFailedResponse(RESPONSE_MESSAGES.FAILED);
      }

      if (confirmPassword && new_password !== confirmPassword) {
        await transaction.rollback();
        return responseTemplates.setFailedResponse(
          RESPONSE_MESSAGES.PASSWORD_NOT_MATCH_ERROR,
        );
      }

      const resetSecret =
        process.env.JWT_SECRET_RESET_PASSWORD ||
        process.env.JWT_SECRET_ACCESS_TOKEN;

      let decoded;
      try {
        decoded = jwt.verify(token, resetSecret);
      } catch (error) {
        await transaction.rollback();
        return responseTemplates.setUnauthorizedResponse(
          RESPONSE_MESSAGES.TOKEN_INVALID_INVALID_ERROR,
        );
      }

      if (!decoded?.sub || decoded?.type !== "reset_password") {
        await transaction.rollback();
        return responseTemplates.setUnauthorizedResponse(
          RESPONSE_MESSAGES.TOKEN_INVALID_INVALID_ERROR,
        );
      }

      const findUser = await usersRepository.findById(
        decoded.sub,
        transaction,
      );
      switch (findUser.code) {
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

      const userUpdatedAt = findUser.result.updated_at
        ? new Date(findUser.result.updated_at)
        : null;
      if (
        userUpdatedAt &&
        Math.floor(userUpdatedAt.getTime() / 1000) >= decoded.iat
      ) {
        await transaction.rollback();
        return responseTemplates.setUnauthorizedResponse(
          RESPONSE_MESSAGES.RESET_LINK_USED_ERROR,
        );
      }

      const hashedPassword = await bcrypt.hash(new_password, 10);
      const updateResult = await usersRepository.updatePassword(
        decoded.sub,
        hashedPassword,
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
