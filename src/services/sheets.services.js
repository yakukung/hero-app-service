import { sequelize } from "../configs/sequelize.configs.js";
import { RESPONSE_MESSAGES } from "../constants/response.constant.js";
import { HTTP_STATUS } from "../constants/http_status.constants.js";
import { responseTemplates } from "../utils/response.utils.js";
import { mapping as sheetsMapping } from "../models/mapping/sheets.mapping.js";
import { repository as sheetsRepository } from "../repositories/sheets.repositories.js";
import { repository as keywordRepository } from "../repositories/keywords.repositories.js";
import { repository as categoryRepository } from "../repositories/categories.repositories.js";
import { repository as sheetsQuestionsRepository } from "../repositories/sheets_questions.repositories.js";
import { repository as sheetsAnswersRepository } from "../repositories/sheets_answers.repositories.js";
import { repository as sheetsFilesRepository } from "../repositories/sheets_files.repositories.js";
import { repository as usersSheetsFavoritesRepository } from "../repositories/users_sheets_favorites.repositories.js";
import { CATEGORY_ENUM_VALUES } from "../constants/db_schema.constants.js";
import {
  deleteUploadedFiles,
  calculateChecksum,
  moveFile,
  resizeImage,
} from "../utils/file.utils.js";

export const service = {
  async getAll(req, res) {
    try {
      const result = await sheetsRepository.findAll();
      switch (result.code) {
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
      const mappedSheet = await sheetsMapping.mapSheetsDetail(
        result.result.data,
        result.result.count,
      );
      return responseTemplates.setOKResponse(mappedSheet);
    } catch (error) {
      console.log(error);
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  },

  async getByUserId(req, res) {
    try {
      const { user_id } = req.params;
      const result = await sheetsRepository.findAllByAuthorId(user_id);
      switch (result.code) {
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
      const mappedSheet = await sheetsMapping.mapSheetsDetail(
        result.result.data,
        result.result.count,
      );
      return responseTemplates.setOKResponse(mappedSheet);
    } catch (error) {
      console.log(error);
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  },

  async getById(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const result = await sheetsRepository.findById(id, transaction);
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
      const mappedSheet = await sheetsMapping.mapSheetDetail(result.result);
      return responseTemplates.setOKResponse(mappedSheet);
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  },

  async deleteSheet(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const result = await sheetsRepository.softDeleteById(
        id,
        req.user.id,
        transaction,
      );
      switch (result.code) {
        case HTTP_STATUS.OK.code:
          break;
        case HTTP_STATUS.CONFLICT.code:
          await transaction.rollback();
          return responseTemplates.setConflictResponse(
            RESPONSE_MESSAGES.SHEET_ALREADY_PURCHASED,
          );
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

  async getFavorites(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const result = await usersSheetsFavoritesRepository.getFavorites(
        req.user.id,
        transaction,
      );
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
      const rawData = result.result.data.map((item) => item.sheet);
      const mappedSheet = await sheetsMapping.mapSheetsDetail(
        rawData,
        result.result.count,
      );
      return responseTemplates.setOKResponse(mappedSheet);
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  },

  async create(req, res) {
    const transaction = await sequelize.transaction();
    const allFiles = req.files || [];

    try {
      const { title, description, keywords, category, price, questions } =
        req.body;
      const normalizedCategory =
        typeof category === "string" ? category.trim() : "";
      if (!CATEGORY_ENUM_VALUES.includes(normalizedCategory)) {
        await transaction.rollback();
        await deleteUploadedFiles(allFiles);
        return responseTemplates.setBadRequestResponse(RESPONSE_MESSAGES.BAD_REQUEST);
      }

      const createSheet = await sheetsRepository.createSheet(
        req.user.id,
        title,
        description,
        price,
        transaction,
      );
      switch (createSheet.code) {
        case HTTP_STATUS.CREATED.code:
          const createSheetCategory = await categoryRepository.create(
            createSheet.result.id,
            normalizedCategory,
            transaction,
          );
          switch (createSheetCategory.code) {
            case HTTP_STATUS.CREATED.code:
              break;
            case HTTP_STATUS.BAD_REQUEST.code:
              await transaction.rollback();
              await deleteUploadedFiles(allFiles);
              return responseTemplates.setBadRequestResponse(
                RESPONSE_MESSAGES.BAD_REQUEST,
              );
            default:
              await transaction.rollback();
              await deleteUploadedFiles(allFiles);
              return responseTemplates.setInternalServerErrorResponse(
                RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
              );
          }

          const normalizedKeywords = Array.isArray(keywords)
            ? keywords
                .filter((keyword) => typeof keyword === "string")
                .map((keyword) => keyword.trim())
                .filter((keyword) => keyword.length > 0)
            : [];
          const uniqueKeywords = [...new Set(normalizedKeywords)];
          for (const keyword of uniqueKeywords) {
            const createKeyword = await keywordRepository.create(
              createSheet.result.id,
              keyword,
              transaction,
            );
            switch (createKeyword.code) {
              case HTTP_STATUS.CREATED.code:
                break;
              case HTTP_STATUS.BAD_REQUEST.code:
                await transaction.rollback();
                await deleteUploadedFiles(allFiles);
                return responseTemplates.setBadRequestResponse(
                  RESPONSE_MESSAGES.BAD_REQUEST,
                );
              default:
                await transaction.rollback();
                await deleteUploadedFiles(allFiles);
                return responseTemplates.setInternalServerErrorResponse(
                  RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
                );
            }
          }
          const parsedQuestions = Array.isArray(questions) ? questions : [];
          if (parsedQuestions.length > 0) {
            for (const question of parsedQuestions) {
              const createQuestion = await sheetsQuestionsRepository.create(
                createSheet.result.id,
                question.index,
                question.question_text,
                question.explanation,
                transaction,
              );
              switch (createQuestion.code) {
                case HTTP_STATUS.CREATED.code:
                  for (const answer of question.answers) {
                    const createAnswer = await sheetsAnswersRepository.create(
                      createQuestion.result.id,
                      answer.index,
                      answer.answer_text,
                      answer.is_correct,
                      transaction,
                    );
                    switch (createAnswer.code) {
                      case HTTP_STATUS.CREATED.code:
                        break;
                      case HTTP_STATUS.BAD_REQUEST.code:
                        await transaction.rollback();
                        await deleteUploadedFiles(allFiles);
                        return responseTemplates.setBadRequestResponse(
                          RESPONSE_MESSAGES.BAD_REQUEST,
                        );
                      default:
                        await transaction.rollback();
                        await deleteUploadedFiles(allFiles);
                        return responseTemplates.setInternalServerErrorResponse(
                          RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
                        );
                    }
                  }
                  break;
                case HTTP_STATUS.BAD_REQUEST.code:
                  await transaction.rollback();
                  await deleteUploadedFiles(allFiles);
                  return responseTemplates.setBadRequestResponse(
                    RESPONSE_MESSAGES.BAD_REQUEST,
                  );
                default:
                  await transaction.rollback();
                  await deleteUploadedFiles(allFiles);
                  return responseTemplates.setInternalServerErrorResponse(
                    RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
                  );
              }
            }
          }

          if (req.files && req.files.length > 0) {
            const originals = req.files;

            for (let i = 0; i < originals.length; i++) {
              const originalFile = originals[i];

              const checksum = await calculateChecksum(originalFile.path);

              // Move Original
              const originalDir = `uploads/sheets/${createSheet.result.id}/original`;
              const originalPath = await moveFile(
                originalFile.path,
                originalDir,
              );
              originalFile.path = originalPath;

              let thumbnailPath = "";
              const thumbnailDir = `uploads/sheets/${createSheet.result.id}/thumbnail`;

              // Generate thumbnail from original
              thumbnailPath = await resizeImage(originalPath, thumbnailDir);
              const createFile = await sheetsFilesRepository.create(
                createSheet.result.id,
                originalFile.mimetype,
                originalFile.size,
                originalPath,
                thumbnailPath,
                checksum,
                i + 1,
                transaction,
              );

              if (createFile.code !== HTTP_STATUS.CREATED.code) {
                await transaction.rollback();
                await deleteUploadedFiles(allFiles);
                return responseTemplates.setBadRequestResponse(
                  RESPONSE_MESSAGES.BAD_REQUEST,
                );
              }
            }
          }
          const findSheet = await sheetsRepository.findById(
            createSheet.result.id,
            transaction,
          );
          if (findSheet.code !== HTTP_STATUS.OK.code) {
            await transaction.rollback();
            await deleteUploadedFiles(allFiles);
            return responseTemplates.setInternalServerErrorResponse(
              RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
            );
          }

          await transaction.commit();

          const mappedSheet = await sheetsMapping.mapSheetDetail(
            findSheet.result,
          );
          return responseTemplates.setCreatedResponse(mappedSheet);
        case HTTP_STATUS.BAD_REQUEST.code:
          await transaction.rollback();
          await deleteUploadedFiles(allFiles);
          return responseTemplates.setBadRequestResponse(RESPONSE_MESSAGES.BAD_REQUEST);
        default:
          await transaction.rollback();
          await deleteUploadedFiles(allFiles);
          return responseTemplates.setInternalServerErrorResponse(
            RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
          );
      }
    } catch (error) {
      await transaction.rollback();
      await deleteUploadedFiles(allFiles);
      console.error(error);
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  },

  async sheetFavorites(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { sheet_id } = req.body;
      const result = await usersSheetsFavoritesRepository.create(
        req.user.id,
        sheet_id,
        transaction,
      );
      switch (result.code) {
        case HTTP_STATUS.CREATED.code:
          break;
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

  async sheetUnFavorites(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { sheet_id } = req.body;
      const result = await usersSheetsFavoritesRepository.delete(
        req.user.id,
        sheet_id,
        transaction,
      );
      switch (result.code) {
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
