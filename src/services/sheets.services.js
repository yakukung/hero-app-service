import { sequelize } from "../configs/sequelize.configs.js";
import { RESPONSE_MESSAGES } from "../constants/response.constant.js";
import { HTTP_STATUS } from "../constants/http_status.constants.js";
import { responseTemplates } from "../utils/response.utils.js";
import { mapping as sheetsMapping } from "../models/mapping/sheets.mapping.js";
import { repository as sheetsRepository } from "../repositories/sheets.repositories.js";
import { repository as keywordRepository } from "../repositories/keywords.repositories.js";
import { repository as sheetsKeywordsRepository } from "../repositories/sheets_keywords.repositories.js";
import { repository as categoryRepository } from "../repositories/categories.repositories.js";
import { repository as sheetsQuestionsRepository } from "../repositories/sheets_questions.repositories.js";
import { repository as sheetsAnswersRepository } from "../repositories/sheets_answers.repositories.js";
import { repository as sheetsCategoriesRepository } from "../repositories/sheets_categories.repositories.js";
import { repository as sheetsFilesRepository } from "../repositories/sheets_files.repositories.js";
import {
  deleteUploadedFiles,
  calculateChecksum,
  moveFile,
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
            RESPONSE_MESSAGES.NOT_FOUND,
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
          return responseTemplates.setNotFoundResponse(
            RESPONSE_MESSAGES.DATA_NOT_FOUND,
          );
        default:
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

  async create(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { title, description, keywords, category, price, questions } =
        req.body;

      let keyword_id = [];

      const findCategory = await categoryRepository.findById(
        category,
        transaction,
      );
      switch (findCategory.code) {
        case HTTP_STATUS.OK.code:
          break;
        case HTTP_STATUS.NOT_FOUND.code:
          await deleteUploadedFiles(req.files);
          return responseTemplates.setNotFoundResponse(
            RESPONSE_MESSAGES.NOT_FOUND,
          );
        default:
          await deleteUploadedFiles(req.files);
          return responseTemplates.setInternalServerErrorResponse(
            RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
          );
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
          const createSheetCategory = await sheetsCategoriesRepository.create(
            createSheet.result.id,
            category,
            transaction,
          );
          switch (createSheetCategory.code) {
            case HTTP_STATUS.CREATED.code:
              break;
            case HTTP_STATUS.FAILED.code:
              await deleteUploadedFiles(req.files);
              return responseTemplates.setFailedResponse(
                RESPONSE_MESSAGES.FAILED,
              );
            default:
              await deleteUploadedFiles(req.files);
              return responseTemplates.setInternalServerErrorResponse(
                RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
              );
          }

          for (const keyword of keywords) {
            const findKeyword = await keywordRepository.findByKeyword(
              keyword,
              transaction,
            );
            switch (findKeyword.code) {
              case HTTP_STATUS.OK.code:
                keyword_id.push(findKeyword.result.id);
                break;
              case HTTP_STATUS.NOT_FOUND.code:
                const createKeyword = await keywordRepository.createKeyword(
                  keyword,
                  transaction,
                );
                switch (createKeyword.code) {
                  case HTTP_STATUS.CREATED.code:
                    keyword_id.push(createKeyword.result.id);
                    break;
                  case HTTP_STATUS.FAILED.code:
                    await deleteUploadedFiles(req.files);
                    return responseTemplates.setFailedResponse(
                      RESPONSE_MESSAGES.FAILED,
                    );
                  default:
                    await deleteUploadedFiles(req.files);
                    return responseTemplates.setInternalServerErrorResponse(
                      RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
                    );
                }
                break;
              default:
                await deleteUploadedFiles(req.files);
                return responseTemplates.setInternalServerErrorResponse(
                  RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
                );
            }
          }
          const uniqueKeywordIds = [...new Set(keyword_id)];
          for (const keyword of uniqueKeywordIds) {
            const createSheetKeyword =
              await sheetsKeywordsRepository.createSheetKeyword(
                createSheet.result.id,
                keyword,
                transaction,
              );
            switch (createSheetKeyword.code) {
              case HTTP_STATUS.CREATED.code:
                const updateUsageCount =
                  await keywordRepository.updateUsageCount(
                    keyword,
                    transaction,
                  );
                switch (updateUsageCount.code) {
                  case HTTP_STATUS.OK.code:
                    break;
                  case HTTP_STATUS.FAILED.code:
                    await deleteUploadedFiles(req.files);
                    return responseTemplates.setFailedResponse(
                      RESPONSE_MESSAGES.FAILED,
                    );
                  default:
                    await deleteUploadedFiles(req.files);
                    return responseTemplates.setInternalServerErrorResponse(
                      RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
                    );
                }
                break;
              case HTTP_STATUS.FAILED.code:
                await deleteUploadedFiles(req.files);
                return responseTemplates.setFailedResponse(
                  RESPONSE_MESSAGES.FAILED,
                );
              default:
                await deleteUploadedFiles(req.files);
                return responseTemplates.setInternalServerErrorResponse(
                  RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
                );
            }
          }
          if (questions != null) {
            for (const question of questions) {
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
                      case HTTP_STATUS.FAILED.code:
                        await deleteUploadedFiles(req.files);
                        return responseTemplates.setFailedResponse(
                          RESPONSE_MESSAGES.FAILED,
                        );
                      default:
                        await deleteUploadedFiles(req.files);
                        return responseTemplates.setInternalServerErrorResponse(
                          RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
                        );
                    }
                  }
                  break;
                case HTTP_STATUS.FAILED.code:
                  await deleteUploadedFiles(req.files);
                  return responseTemplates.setFailedResponse(
                    RESPONSE_MESSAGES.FAILED,
                  );
                default:
                  await deleteUploadedFiles(req.files);
                  return responseTemplates.setInternalServerErrorResponse(
                    RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
                  );
              }
            }
          }

          if (req.files) {
            let index = 1;
            for (const file of req.files) {
              const checksum = await calculateChecksum(file.path);

              const newDir = `uploads/sheets/${createSheet.result.id}`;
              const newPath = await moveFile(file.path, newDir);

              const createFile = await sheetsFilesRepository.create(
                createSheet.result.id,
                file.mimetype,
                file.size,
                newPath,
                checksum,
                index,
                transaction,
              );

              if (createFile.code !== HTTP_STATUS.CREATED.code) {
                file.path = newPath;
                await deleteUploadedFiles(req.files);
                return responseTemplates.setFailedResponse(
                  RESPONSE_MESSAGES.FAILED,
                );
              }
              file.path = newPath;
              index++;
            }
          }
          const findSheet = await sheetsRepository.findById(
            createSheet.result.id,
            transaction,
          );
          await transaction.commit();

          if (findSheet.code !== HTTP_STATUS.OK.code) {
            await deleteUploadedFiles(req.files);
            return responseTemplates.setInternalServerErrorResponse(
              RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
            );
          }

          const mappedSheet = await sheetsMapping.mapSheetDetail(
            findSheet.result,
          );
          return responseTemplates.setCreatedResponse(mappedSheet);
        case HTTP_STATUS.FAILED.code:
          await deleteUploadedFiles(req.files);
          return responseTemplates.setFailedResponse(RESPONSE_MESSAGES.FAILED);
        default:
          await deleteUploadedFiles(req.files);
          return responseTemplates.setInternalServerErrorResponse(
            RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
          );
      }
    } catch (error) {
      await transaction.rollback();
      await deleteUploadedFiles(req.files);
      console.error(error);
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  },
};
