import { sequelize } from "../configs/sequelize.configs.js";
import { repository as postsRepository } from "../repositories/posts.repositories.js";
import { RESPONSE_MESSAGES } from "../constants/response.constant.js";
import { HTTP_STATUS } from "../constants/http_status.constants.js";
import { responseTemplates } from "../utils/response.utils.js";
import { mapping as postsMapping } from "../models/mapping/posts.mapping.js";
export const service = {
  async getAll(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const result = await postsRepository.findAll(transaction);
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
      const mappedData = await postsMapping.mapPosts(
        result.result.data,
        result.result.count,
      );

      await transaction.commit();
      return responseTemplates.setOKResponse(mappedData);
    } catch (error) {
      await transaction.rollback();
      console.log(error);
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  },

  async getById(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const result = await postsRepository.findById(req.params.id, transaction);
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
      const mappedData = await postsMapping.mapPost(result.result);

      await transaction.commit();
      return responseTemplates.setOKResponse(mappedData);
    } catch (error) {
      await transaction.rollback();
      console.log(error);
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  },
  async create(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { content, sheet_id } = req.body;
      const { id } = req.user;
      const createPost = await postsRepository.create(
        { content, sheet_id, user_id: id },
        transaction,
      );

      switch (createPost.code) {
        case HTTP_STATUS.CREATED.code:
          break;
        case HTTP_STATUS.FAILED.code:
          await transaction.rollback();
          return responseTemplates.setFailedResponse(RESPONSE_MESSAGES.FAILED);
        default:
          await transaction.rollback();
          return responseTemplates.setInternalServerErrorResponse(
            RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
          );
      }
      const findPost = await postsRepository.findById(
        createPost.result.id,
        transaction,
      );

      if (findPost.code !== HTTP_STATUS.OK.code) {
        await transaction.rollback();
        return responseTemplates.setInternalServerErrorResponse(
          RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        );
      }

      await transaction.commit();
      const mapData = await postsMapping.mapPost(findPost.result);
      return responseTemplates.setCreatedResponse(mapData);
    } catch (error) {
      await transaction.rollback();
      console.log(error);
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  },
  async like(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      const findPost = await postsRepository.findById(id, transaction);
      if (findPost.code !== HTTP_STATUS.OK.code) {
        await transaction.rollback();
        return responseTemplates.setNotFoundResponse(
          RESPONSE_MESSAGES.DATA_NOT_FOUND,
        );
      }

      const findLike = await postsRepository.findLike(user_id, id, transaction);
      if (findLike.code === HTTP_STATUS.OK.code) {
        await transaction.rollback();
        return responseTemplates.setConflictResponse(
          RESPONSE_MESSAGES.DATA_ALREADY_EXIST,
        );
      }

      const addLike = await postsRepository.addLike(
        { post_id: id, user_id },
        transaction,
      );

      if (addLike.code !== HTTP_STATUS.CREATED.code) {
        await transaction.rollback();
        return responseTemplates.setInternalServerErrorResponse(
          RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        );
      }

      await transaction.commit();
      return responseTemplates.setNoContentResponse();
    } catch (error) {
      await transaction.rollback();
      console.log(error);
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  },

  async unlike(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      const findPost = await postsRepository.findById(id, transaction);
      if (findPost.code !== HTTP_STATUS.OK.code) {
        await transaction.rollback();
        return responseTemplates.setNotFoundResponse(
          RESPONSE_MESSAGES.DATA_NOT_FOUND,
        );
      }

      const findLike = await postsRepository.findLike(user_id, id, transaction);

      if (findLike.code !== HTTP_STATUS.OK.code) {
        await transaction.rollback();
        return responseTemplates.setConflictResponse(
          RESPONSE_MESSAGES.DATA_ALREADY_EXIST,
        );
      }

      const removeLike = await postsRepository.removeLike(
        user_id,
        id,
        transaction,
      );

      if (removeLike.code !== HTTP_STATUS.OK.code) {
        await transaction.rollback();
        return responseTemplates.setInternalServerErrorResponse(
          RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        );
      }

      await transaction.commit();
      return responseTemplates.setNoContentResponse();
    } catch (error) {
      await transaction.rollback();
      console.log(error);
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  },
  async comment(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { content } = req.body;
      const user_id = req.user.id;

      const findPost = await postsRepository.findById(id, transaction);
      if (findPost.code !== HTTP_STATUS.OK.code) {
        await transaction.rollback();
        return responseTemplates.setNotFoundResponse(
          RESPONSE_MESSAGES.DATA_NOT_FOUND,
        );
      }

      const addComment = await postsRepository.addComment(
        { post_id: id, user_id, content },
        transaction,
      );

      switch (addComment.code) {
        case HTTP_STATUS.CREATED.code:
          break;
        case HTTP_STATUS.FAILED.code:
          await transaction.rollback();
          return responseTemplates.setFailedResponse(RESPONSE_MESSAGES.FAILED);
        default:
          await transaction.rollback();
          return responseTemplates.setInternalServerErrorResponse(
            RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
          );
      }

      await transaction.commit();
      return responseTemplates.setCreatedResponse(addComment.result);
    } catch (error) {
      await transaction.rollback();
      console.log(error);
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  },
  async deleteComment(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { id, commentId } = req.params;
      console.log("🚀 ~ commentId:", commentId);
      console.log("🚀 ~ id:", id);

      const findPost = await postsRepository.findById(id, transaction);
      if (findPost.code !== HTTP_STATUS.OK.code) {
        await transaction.rollback();
        return responseTemplates.setNotFoundResponse(
          RESPONSE_MESSAGES.DATA_NOT_FOUND,
        );
      }

      const removeComment = await postsRepository.removeComment(
        commentId,
        id,
        transaction,
      );

      switch (removeComment.code) {
        case HTTP_STATUS.OK.code:
          break;
        case HTTP_STATUS.NOT_FOUND.code:
          await transaction.rollback();
          return responseTemplates.setNotFoundResponse(
            RESPONSE_MESSAGES.DATA_NOT_FOUND,
          );
        case HTTP_STATUS.FAILED.code:
          await transaction.rollback();
          return responseTemplates.setFailedResponse(RESPONSE_MESSAGES.FAILED);
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
      console.log(error);
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  },
  async share(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      const findPost = await postsRepository.findById(id, transaction);
      if (findPost.code !== HTTP_STATUS.OK.code) {
        await transaction.rollback();
        return responseTemplates.setNotFoundResponse(
          RESPONSE_MESSAGES.DATA_NOT_FOUND,
        );
      }

      const addShare = await postsRepository.addShare(
        { post_id: id, user_id },
        transaction,
      );

      switch (addShare.code) {
        case HTTP_STATUS.CREATED.code:
          break;
        case HTTP_STATUS.FAILED.code:
          await transaction.rollback();
          return responseTemplates.setFailedResponse(RESPONSE_MESSAGES.FAILED);
        default:
          await transaction.rollback();
          return responseTemplates.setInternalServerErrorResponse(
            RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
          );
      }

      await transaction.commit();
      return responseTemplates.setCreatedResponse(addShare.result);
    } catch (error) {
      await transaction.rollback();
      console.log(error);
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  },
};
