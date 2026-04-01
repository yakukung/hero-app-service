import bcrypt from "bcrypt";
import fs from "fs";
import { sequelize } from "../configs/sequelize.configs.js";
import { repository as usersRepository } from "../repositories/users.repositories.js";
import { repository as rolesRepository } from "../repositories/roles.repositories.js";
import { repository as sessionsRepository } from "../repositories/sessions.repositories.js";
import { repository as tokensRepository } from "../repositories/tokens.repositories.js";
import { repository as usersFollowsRepository } from "../repositories/users_follows.repositories.js";
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
  async getAll(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const findAllUsers = await usersRepository.findAll(transaction);
      switch (findAllUsers.code) {
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
      const mapData = await usersMapping.mapUsers(
        findAllUsers.result.data,
        findAllUsers.result.count,
      );
      await transaction.commit();

      return responseTemplates.setOKResponse(mapData);
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  },
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
      const mapData = await usersMapping.mapUserDetail(findUserById);
      await transaction.commit();
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
      const uid = req.user?.id;
      if (!uid) {
        await transaction.rollback();
        return responseTemplates.setUnauthorizedResponse(
          RESPONSE_MESSAGES.TOKEN_INVALID_INVALID_ERROR,
        );
      }
      if (!req.file) {
        await transaction.rollback();
        return responseTemplates.setBadRequestResponse(RESPONSE_MESSAGES.BAD_REQUEST);
      }
      let oldProfileImagePath = null;
      const profile_image = req.file.path;

      const user = await usersRepository.findById(uid, transaction);
      switch (user.code) {
        case HTTP_STATUS.OK.code:
          oldProfileImagePath = user.result.profile_image;
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
      const updateResult = await usersRepository.updateProfileImage(
        uid,
        profile_image,
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
      if (
        oldProfileImagePath &&
        oldProfileImagePath !== profile_image &&
        fs.existsSync(oldProfileImagePath)
      ) {
        try {
          fs.unlinkSync(oldProfileImagePath);
        } catch (fileError) {
          console.error(fileError);
        }
      }
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
      const uid = req.user?.id || req.body.uid;
      if (!uid) {
        await transaction.rollback();
        return responseTemplates.setUnauthorizedResponse(
          RESPONSE_MESSAGES.TOKEN_INVALID_INVALID_ERROR,
        );
      }
      let { username, password } = req.body;
      if (!username) username = undefined;
      if (!password) password = undefined;
      let oldProfileImagePath = null;

      if (password) {
        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);
      }
      let profile_image = undefined;

      if (req.file) {
        const user = await usersRepository.findById(uid, transaction);
        switch (user.code) {
          case HTTP_STATUS.OK.code:
            oldProfileImagePath = user.result.profile_image;
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
        profile_image = req.file.path;
      }
      const updateResult = await usersRepository.updateProfile(
        uid,
        username,
        password,
        profile_image,
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
        case HTTP_STATUS.BAD_REQUEST.code:
          await transaction.rollback();
          return responseTemplates.setBadRequestResponse(RESPONSE_MESSAGES.BAD_REQUEST);
        default:
          await transaction.rollback();
          return responseTemplates.setInternalServerErrorResponse(
            RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
          );
      }

      await transaction.commit();
      if (
        oldProfileImagePath &&
        profile_image &&
        oldProfileImagePath !== profile_image &&
        fs.existsSync(oldProfileImagePath)
      ) {
        try {
          fs.unlinkSync(oldProfileImagePath);
        } catch (fileError) {
          console.error(fileError);
        }
      }
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
      const uid = req.user?.id;
      if (!uid) {
        await transaction.rollback();
        return responseTemplates.setUnauthorizedResponse(
          RESPONSE_MESSAGES.TOKEN_INVALID_INVALID_ERROR,
        );
      }
      let { old_password, new_password } = req.body;

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
      const uid = req.user?.id;
      if (!uid) {
        await transaction.rollback();
        return responseTemplates.setUnauthorizedResponse(
          RESPONSE_MESSAGES.TOKEN_INVALID_INVALID_ERROR,
        );
      }
      let { username } = req.body;
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
      const uid = req.user?.id;
      if (!uid) {
        await transaction.rollback();
        return responseTemplates.setUnauthorizedResponse(
          RESPONSE_MESSAGES.TOKEN_INVALID_INVALID_ERROR,
        );
      }
      let { email, password } = req.body;

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
  async updateStatusFlag(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { status_flag } = req.body;
      if (id !== req.user?.id) {
        await transaction.rollback();
        return responseTemplates.setForbiddenResponse(
          RESPONSE_MESSAGES.AUTHENTICATION_INVALID_ERROR,
        );
      }
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
      const updateResult = await usersRepository.updateStatusFlag(
        id,
        status_flag,
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
  async updateKeyword(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { keyword } = req.body;
      if (id !== req.user?.id) {
        await transaction.rollback();
        return responseTemplates.setForbiddenResponse(
          RESPONSE_MESSAGES.AUTHENTICATION_INVALID_ERROR,
        );
      }
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
      const updateResult = await usersRepository.updateKeyword(
        id,
        keyword,
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
  async follow(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const follower_id = req.user.id;

      if (follower_id === id) {
        await transaction.rollback();
        return responseTemplates.setBadRequestResponse(RESPONSE_MESSAGES.BAD_REQUEST);
      }

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

      const findFollow = await usersFollowsRepository.findFollow(
        follower_id,
        id,
        transaction,
      );
      if (findFollow.code === HTTP_STATUS.OK.code) {
        await transaction.rollback();
        return responseTemplates.setOKResponse({
          follower_id,
          following_id: id,
          already_following: true,
        });
      }
      if (findFollow.code !== HTTP_STATUS.NOT_FOUND.code) {
        await transaction.rollback();
        return responseTemplates.setInternalServerErrorResponse(
          RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        );
      }

      const addFollow = await usersFollowsRepository.create(
        follower_id,
        id,
        transaction,
      );
      switch (addFollow.code) {
        case HTTP_STATUS.CREATED.code:
          break;
        case HTTP_STATUS.CONFLICT.code:
          await transaction.rollback();
          return responseTemplates.setOKResponse({
            follower_id,
            following_id: id,
            already_following: true,
          });
        case HTTP_STATUS.BAD_REQUEST.code:
          await transaction.rollback();
          return responseTemplates.setBadRequestResponse(RESPONSE_MESSAGES.BAD_REQUEST);
        default:
          await transaction.rollback();
          return responseTemplates.setInternalServerErrorResponse(
            RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
          );
      }

      await transaction.commit();
      return responseTemplates.setCreatedResponse({
        follower_id,
        following_id: id,
      });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  },
  async unfollow(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const follower_id = req.user.id;

      if (follower_id === id) {
        await transaction.rollback();
        return responseTemplates.setBadRequestResponse(RESPONSE_MESSAGES.BAD_REQUEST);
      }

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

      const findFollow = await usersFollowsRepository.findFollow(
        follower_id,
        id,
        transaction,
      );
      if (findFollow.code === HTTP_STATUS.NOT_FOUND.code) {
        await transaction.rollback();
        return responseTemplates.setNoContentResponse();
      }
      if (findFollow.code !== HTTP_STATUS.OK.code) {
        await transaction.rollback();
        return responseTemplates.setInternalServerErrorResponse(
          RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        );
      }

      const removeFollow = await usersFollowsRepository.delete(
        follower_id,
        id,
        transaction,
      );
      switch (removeFollow.code) {
        case HTTP_STATUS.OK.code:
          break;
        case HTTP_STATUS.NOT_FOUND.code:
          await transaction.rollback();
          return responseTemplates.setNoContentResponse();
        case HTTP_STATUS.BAD_REQUEST.code:
          await transaction.rollback();
          return responseTemplates.setBadRequestResponse(RESPONSE_MESSAGES.BAD_REQUEST);
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
