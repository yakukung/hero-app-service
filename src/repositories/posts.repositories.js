import { HTTP_STATUS } from "../constants/http_status.constants.js";
import { models as sequelize } from "../models/sequelize/associations.js";
import { responseRepository } from "../utils/response.utils.js";
import { Sequelize } from "sequelize";

export const repository = {
  async findAll(transaction) {
    try {
      const rows = await sequelize.Posts.findAndCountAll({
        include: [
          {
            model: sequelize.Users,
            as: "author",
          },
          {
            model: sequelize.Sheets,
            as: "sheet",
          },
          {
            model: sequelize.PostsLikes,
            as: "likes",
            attributes: ["user_id"],
          },
          {
            model: sequelize.PostsComments,
            as: "comments",
            attributes: ["user_id", "content", "created_at"],
          },
          {
            model: sequelize.PostsShares,
            as: "shares",
            attributes: ["user_id"],
          },
        ],
        distinct: true,
        transaction,
      });
      if (rows.count === 0) {
        return responseRepository.setResult(HTTP_STATUS.NOT_FOUND, null);
      }

      const result = {
        count: rows.count,
        data: rows.rows,
      };

      return responseRepository.setResult(HTTP_STATUS.OK, result);
    } catch (error) {
      console.log(error);
      return responseRepository.setResult(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        null,
      );
    }
  },
  async findById(id, transaction) {
    try {
      const result = await sequelize.Posts.findOne({
        include: [
          {
            model: sequelize.Users,
            as: "author",
          },
          {
            model: sequelize.Sheets,
            as: "sheet",
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
      return responseRepository.setResult(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        null,
      );
    }
  },

  async create(data, transaction) {
    try {
      const result = await sequelize.Posts.create(data, { transaction });

      if (!result) {
        return responseRepository.setResult(HTTP_STATUS.FAILED, null);
      }

      return responseRepository.setResult(
        HTTP_STATUS.CREATED,
        result.dataValues,
      );
    } catch (error) {
      console.error(error);
      return responseRepository.setResult(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        null,
      );
    }
  },

  async findLike(userId, postId, transaction) {
    try {
      const result = await sequelize.PostsLikes.findOne({
        where: { user_id: userId, post_id: postId },
        transaction,
      });

      if (result === null) {
        return responseRepository.setResult(HTTP_STATUS.NOT_FOUND, null);
      }

      return responseRepository.setResult(HTTP_STATUS.OK, result);
    } catch (error) {
      console.error(error);
      return responseRepository.setResult(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        null,
      );
    }
  },

  async addLike(data, transaction) {
    try {
      const result = await sequelize.PostsLikes.create(data, {
        transaction,
      });

      if (!result) {
        return responseRepository.setResult(HTTP_STATUS.FAILED, null);
      }

      const updatePost = await sequelize.Posts.update(
        { like_count: Sequelize.literal("like_count + 1") },
        { where: { id: data.post_id }, transaction },
      );

      if (!updatePost) {
        return responseRepository.setResult(HTTP_STATUS.FAILED, null);
      }

      return responseRepository.setResult(
        HTTP_STATUS.CREATED,
        result.dataValues,
      );
    } catch (error) {
      console.error(error);
      return responseRepository.setResult(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        null,
      );
    }
  },

  async removeLike(userId, postId, transaction) {
    try {
      const result = await sequelize.PostsLikes.destroy({
        where: { user_id: userId, post_id: postId },
        transaction,
      });

      if (result === 0) {
        return responseRepository.setResult(HTTP_STATUS.NOT_FOUND, null);
      }

      const updatePost = await sequelize.Posts.update(
        { like_count: Sequelize.literal("like_count - 1") },
        { where: { id: postId }, transaction },
      );

      if (!updatePost) {
        return responseRepository.setResult(HTTP_STATUS.FAILED, null);
      }

      return responseRepository.setResult(HTTP_STATUS.OK, null);
    } catch (error) {
      console.error(error);
      return responseRepository.setResult(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        null,
      );
    }
  },
};
