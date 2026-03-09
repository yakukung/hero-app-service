import { ValidationError, Op } from "sequelize";
import { HTTP_STATUS } from "../constants/http_status.constants.js";
import { sequelize as db } from "../configs/sequelize.configs.js";
import { models as sequelize } from "../models/sequelize/associations.js";
import { responseRepository } from "../utils/response.utils.js";
import { STATUS_FLAG } from "../constants/status_flag.constants.js";

export const repository = {
  async findAll(transaction) {
    try {
      const rows = await sequelize.Users.findAndCountAll({
        distinct: true,
        include: [
          {
            model: sequelize.Roles,
            as: "roles",
            where: {
              name: {
                [Op.ne]: "ADMIN",
              },
            },
          },
        ],
        transaction,
      });
      if (rows.rows.length === 0) {
        return responseRepository.setResult(HTTP_STATUS.NOT_FOUND, null);
      }
      const result = {
        count: rows.count,
        data: rows.rows,
      };

      return responseRepository.setResult(HTTP_STATUS.OK, result);
    } catch (error) {
      console.log(error);
      return responseRepository.setResult(HTTP_STATUS.SERVER_ERROR, null);
    }
  },
  async findById(id, transaction) {
    try {
      const result = await sequelize.Users.findOne({
        include: [
          {
            model: sequelize.Roles,
            as: "roles",
          },
          {
            model: sequelize.Sessions,
            as: "sessions",
            include: [
              {
                model: sequelize.Tokens,
                as: "tokens",
              },
            ],
          },
          {
            model: sequelize.Wallets,
            as: "wallet",
          },
          {
            model: sequelize.Users,
            as: "followers",
            attributes: ["id"],
            through: { attributes: [] },
          },
          {
            model: sequelize.Users,
            as: "followings",
            attributes: ["id"],
            through: { attributes: [] },
          },
        ],
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
      const result = await sequelize.Users.create(
        {
          username,
          email,
          password,
          role_id,
          visible_flag: false,
          status_flag: STATUS_FLAG.PENDING,
        },
        { transaction },
      );

      if (result === null) {
        return responseRepository.setResult(HTTP_STATUS.FAILED, null);
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

  async createUserByProvider(
    profile_image,
    auth_provider,
    role_id,
    status_flag,
    username,
    transaction,
  ) {
    try {
      const result = await sequelize.Users.create(
        {
          auth_provider,
          role_id,
          status_flag,
          profile_image,
          username,
        },
        { transaction },
      );

      if (result === null) {
        return responseRepository.setResult(HTTP_STATUS.FAILED, null);
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
  async updateStatusUser(user_id, transaction) {
    try {
      const result = await sequelize.Users.update(
        {
          visible_flag: true,
          status_flag: STATUS_FLAG.ACTIVE,
        },
        { where: { id: user_id }, transaction },
      );

      if (result === null) {
        return responseRepository.setResult(HTTP_STATUS.FAILED, null);
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
  async updateProfileImage(uid, profile_image, transaction) {
    try {
      const result = await sequelize.Users.update(
        {
          profile_image,
        },
        { where: { id: uid }, transaction },
      );

      if (result === null) {
        return responseRepository.setResult(HTTP_STATUS.FAILED, null);
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
  async updateProfile(uid, username, password, profile_image, transaction) {
    try {
      const updateData = {};
      if (username !== undefined) updateData.username = username;
      if (password !== undefined) updateData.password = password;
      if (profile_image !== undefined) updateData.profile_image = profile_image;

      const result = await sequelize.Users.update(updateData, {
        where: { id: uid },
        transaction,
      });

      if (result === null) {
        return responseRepository.setResult(HTTP_STATUS.FAILED, null);
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
  async updatePassword(uid, password, transaction) {
    try {
      const result = await sequelize.Users.update(
        {
          password,
        },
        { where: { id: uid }, transaction },
      );

      if (result === null) {
        return responseRepository.setResult(HTTP_STATUS.FAILED, null);
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
  async updateUsername(uid, username, transaction) {
    try {
      const result = await sequelize.Users.update(
        {
          username,
        },
        { where: { id: uid }, transaction },
      );

      if (result === null) {
        return responseRepository.setResult(HTTP_STATUS.FAILED, null);
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
  async updateEmail(uid, email, transaction) {
    try {
      const result = await sequelize.Users.update(
        {
          email,
        },
        { where: { id: uid }, transaction },
      );

      if (result === null) {
        return responseRepository.setResult(HTTP_STATUS.FAILED, null);
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
  async updateStatusFlag(uid, status_flag, transaction) {
    try {
      const result = await sequelize.Users.update(
        {
          status_flag,
        },
        { where: { id: uid }, transaction },
      );

      if (result === null) {
        return responseRepository.setResult(HTTP_STATUS.FAILED, null);
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
  async updateKeyword(uid, keyword, transaction) {
    try {
      const result = await sequelize.Users.update(
        {
          keyword,
        },
        { where: { id: uid }, transaction },
      );

      if (result === null) {
        return responseRepository.setResult(HTTP_STATUS.FAILED, null);
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
};
