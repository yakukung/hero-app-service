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

      return responseTemplates.setOkResponse(result);
    } catch (error) {
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
};
