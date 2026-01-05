import { sequelize } from "../configs/sequelize.configs.js";
import { RESPONSE_MESSAGES } from "../constants/response.constant.js";
import { HTTP_STATUS } from "../constants/http_status.constants.js";
import { responseTemplates } from "../utils/response.utils.js";
import { mapping as sheetsMapping } from "../models/mapping/sheets.mapping.js";
import { repository as sheetsRepository } from "../repositories/sheets.repositories.js";
import { repository as keywordRepository } from "../repositories/keywords.repositories.js";
import { repository as sheetsKeywordsRepository } from "../repositories/sheets_keywords.repositories.js";

export const service = {
  async create(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { title, description, course, keywords, price, sheets_questions } =
        req.body;
      let keyword_id = [];

      const createSheet = await sheetsRepository.createSheet(
        req.user.id,
        title,
        description,
        course,
        price,
        transaction
      );
      switch (createSheet.code) {
        case HTTP_STATUS.CREATED.code:
          for (const keyword of keywords) {
            const findKeyword = await keywordRepository.findByKeyword(
              keyword,
              transaction
            );
            switch (findKeyword.code) {
              case HTTP_STATUS.OK.code:
                keyword_id.push(findKeyword.result.id);
                break;
              case HTTP_STATUS.NOT_FOUND.code:
                const createKeyword = await keywordRepository.createKeyword(
                  keyword,
                  transaction
                );
                switch (createKeyword.code) {
                  case HTTP_STATUS.CREATED.code:
                    keyword_id.push(createKeyword.result.id);
                    break;
                  case HTTP_STATUS.FAILED.code:
                    return responseTemplates.setFailedResponse(
                      RESPONSE_MESSAGES.FAILED
                    );
                  default:
                    return responseTemplates.setInternalServerErrorResponse(
                      RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR
                    );
                }
                break;
              default:
                return responseTemplates.setInternalServerErrorResponse(
                  RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR
                );
            }
          }
          for (const keyword of keyword_id) {
            const createSheetKeyword =
              await sheetsKeywordsRepository.createSheetKeyword(
                createSheet.result.id,
                keyword,
                transaction
              );
            switch (createSheetKeyword.code) {
              case HTTP_STATUS.CREATED.code:
                break;
              case HTTP_STATUS.FAILED.code:
                return responseTemplates.setFailedResponse(
                  RESPONSE_MESSAGES.FAILED
                );
              default:
                return responseTemplates.setInternalServerErrorResponse(
                  RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR
                );
            }
          }
          const findSheet = await sheetsRepository.findById(
            createSheet.result.id,
            transaction
          );
          await transaction.commit();
          const mappedSheet = await sheetsMapping.mapSheetDetail(findSheet.result);
          return responseTemplates.setCreatedResponse(mappedSheet);
        case HTTP_STATUS.FAILED.code:
          return responseTemplates.setFailedResponse(RESPONSE_MESSAGES.FAILED);
        default:
          return responseTemplates.setInternalServerErrorResponse(
            RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR
          );
      }
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR
      );
    }
  },
};
