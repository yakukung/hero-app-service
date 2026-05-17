import { Op } from "sequelize";
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
import { models } from "../models/sequelize/associations.js";
import { isAdminRole } from "../utils/authz.utils.js";
import { message, toNumber, toPlain } from "../utils/backend.utils.js";

const mapPurchasedSheet = (sheet) => ({
  id: sheet.id,
  title: sheet.title,
  description: sheet.description,
  rating: sheet.rating,
  price: toNumber(sheet.price),
  is_purchased: true,
  created_at: sheet.created_at,
});

const mapPurchase = (purchase) => ({
  id: purchase.id,
  sheet_id: purchase.sheet_id,
  amount: toNumber(purchase.amount),
  payment_method: purchase.payment_method,
  payment_status: purchase.payment_status,
  created_at: purchase.created_at,
});

const mapReview = (row) => {
  const review = toPlain(row);
  return {
    id: review.id,
    sheet_id: review.sheet_id,
    user_id: review.user_id,
    username: review.user?.username,
    profile_image: review.user?.profile_image,
    content: review.content,
    score: review.score,
    created_at: review.created_at,
    updated_at: review.updated_at,
  };
};

const recalculateSheetRating = async (sheetId, transaction) => {
  const reviews = await models.SheetsReviews.findAll({
    attributes: ["score"],
    where: {
      sheet_id: sheetId,
      visible_flag: {
        [Op.ne]: false,
      },
      status_flag: "ACTIVE",
    },
    transaction,
  });

  const rating =
    reviews.length === 0
      ? 0
      : reviews.reduce((sum, review) => sum + toNumber(review.score), 0) /
        reviews.length;

  await models.Sheets.update(
    {
      rating: rating.toFixed(1),
      updated_at: new Date(),
    },
    {
      where: { id: sheetId },
      transaction,
    },
  );
};

export const service = {
  async getPurchased(req, res) {
    try {
      const purchases = await models.BuySheets.findAll({
        where: {
          user_id: req.user.id,
          payment_status: "SUCCESSFUL",
          visible_flag: {
            [Op.ne]: false,
          },
        },
        include: [
          {
            model: models.Sheets,
            as: "sheet",
            required: true,
            where: {
              visible_flag: {
                [Op.ne]: false,
              },
              status_flag: "ACTIVE",
            },
          },
        ],
        order: [["created_at", "DESC"]],
      });

      return responseTemplates.setOKResponse({
        sheets: purchases.map((purchase) =>
          mapPurchasedSheet(toPlain(purchase).sheet),
        ),
      });
    } catch (error) {
      console.log(error);
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  },

  async purchase(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const sheet = await models.Sheets.findOne({
        where: {
          id,
          visible_flag: {
            [Op.ne]: false,
          },
          status_flag: "ACTIVE",
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!sheet) {
        await transaction.rollback();
        return responseTemplates.setNotFoundResponse(
          RESPONSE_MESSAGES.DATA_NOT_FOUND,
        );
      }

      const user = await models.Users.findOne({
        where: {
          id: req.user.id,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!user) {
        await transaction.rollback();
        return responseTemplates.setUnauthorizedResponse(
          RESPONSE_MESSAGES.TOKEN_INVALID_INVALID_ERROR,
        );
      }

      const existingPurchase = await models.BuySheets.findOne({
        where: {
          user_id: req.user.id,
          sheet_id: id,
          payment_status: "SUCCESSFUL",
          visible_flag: {
            [Op.ne]: false,
          },
        },
        transaction,
      });

      if (existingPurchase) {
        await transaction.commit();
        return responseTemplates.setOKResponse({
          purchase: mapPurchase(toPlain(existingPurchase)),
          wallet: {
            balance: toNumber(user.total_wallet),
          },
          is_purchased: true,
        });
      }

      if (sheet.author_id === req.user.id) {
        await transaction.commit();
        return responseTemplates.setOKResponse({
          purchase: null,
          wallet: {
            balance: toNumber(user.total_wallet),
          },
          is_purchased: true,
        });
      }

      const price = toNumber(sheet.price);
      const paymentMethod = req.body.payment_method || "WALLET";
      if (paymentMethod !== "WALLET") {
        await transaction.rollback();
        return responseTemplates.setBadRequestResponse(
          message(
            "รองรับการซื้อชีตด้วย Wallet เท่านั้น",
            "Only wallet sheet purchases are supported.",
          ),
        );
      }

      if (price > toNumber(user.total_wallet)) {
        await transaction.rollback();
        return responseTemplates.setConflictResponse(
          message(
            "ยอดเงินใน Wallet ไม่เพียงพอ",
            "Insufficient wallet balance.",
          ),
        );
      }

      const nextBalance = toNumber(user.total_wallet) - price;
      if (price > 0) {
        await user.update(
          {
            total_wallet: nextBalance,
            updated_by: req.user.id,
          },
          { transaction },
        );
      }

      const purchase = await models.BuySheets.create(
        {
          user_id: req.user.id,
          sheet_id: id,
          payment_method: "WALLET",
          amount: price,
          payment_status: "SUCCESSFUL",
          created_by: req.user.id,
        },
        { transaction },
      );

      await transaction.commit();
      return responseTemplates.setCreatedResponse({
        purchase: mapPurchase(toPlain(purchase)),
        wallet: {
          balance: nextBalance,
        },
        is_purchased: true,
      });
    } catch (error) {
      await transaction.rollback();
      console.log(error);
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  },

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

  async updateSheet(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const title = String(req.body.title || "").trim();
      const description =
        req.body.description == null
          ? null
          : String(req.body.description).trim();
      const price = toNumber(req.body.price);

      if (!title || price < 0) {
        await transaction.rollback();
        return responseTemplates.setBadRequestResponse(
          RESPONSE_MESSAGES.BAD_REQUEST,
        );
      }

      const sheet = await models.Sheets.findOne({
        where: {
          id,
          author_id: req.user.id,
          visible_flag: {
            [Op.ne]: false,
          },
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!sheet) {
        await transaction.rollback();
        return responseTemplates.setNotFoundResponse(
          RESPONSE_MESSAGES.DATA_NOT_FOUND,
        );
      }

      await sheet.update(
        {
          title,
          description,
          price,
          updated_at: new Date(),
          updated_by: req.user.id,
        },
        { transaction },
      );

      await transaction.commit();
      return responseTemplates.setOKResponse({
        id: sheet.id,
        title,
        description,
        price,
      });
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
        return responseTemplates.setBadRequestResponse(
          RESPONSE_MESSAGES.BAD_REQUEST,
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

              const originalDir = `uploads/sheets/${createSheet.result.id}/original`;
              const originalPath = await moveFile(
                originalFile.path,
                originalDir,
              );
              originalFile.path = originalPath;

              let thumbnailPath = "";
              const thumbnailDir = `uploads/sheets/${createSheet.result.id}/thumbnail`;

              if (originalFile.mimetype.startsWith("image/")) {
                thumbnailPath = await resizeImage(originalPath, thumbnailDir);
              } else {
                thumbnailPath = originalPath;
              }
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
          return responseTemplates.setBadRequestResponse(
            RESPONSE_MESSAGES.BAD_REQUEST,
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
          return responseTemplates.setBadRequestResponse(
            RESPONSE_MESSAGES.BAD_REQUEST,
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

  async getReviews(req, res) {
    try {
      const { id } = req.params;
      const sheet = await models.Sheets.findOne({
        attributes: ["id"],
        where: {
          id,
          visible_flag: {
            [Op.ne]: false,
          },
        },
      });

      if (!sheet) {
        return responseTemplates.setNotFoundResponse(
          RESPONSE_MESSAGES.DATA_NOT_FOUND,
        );
      }

      const reviews = await models.SheetsReviews.findAll({
        where: {
          sheet_id: id,
          visible_flag: {
            [Op.ne]: false,
          },
          status_flag: "ACTIVE",
        },
        include: [
          {
            model: models.Users,
            as: "user",
            attributes: ["id", "username", "profile_image"],
          },
        ],
        order: [["created_at", "DESC"]],
      });

      return responseTemplates.setOKResponse({
        reviews: reviews.map(mapReview),
      });
    } catch (error) {
      console.log(error);
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  },

  async upsertReview(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const score = Number(req.body.score);
      const content = req.body.content || null;

      if (!Number.isInteger(score) || score < 1 || score > 5) {
        await transaction.rollback();
        return responseTemplates.setBadRequestResponse(
          RESPONSE_MESSAGES.BAD_REQUEST,
        );
      }

      const sheet = await models.Sheets.findOne({
        attributes: ["id"],
        where: {
          id,
          visible_flag: {
            [Op.ne]: false,
          },
          status_flag: "ACTIVE",
        },
        transaction,
      });

      if (!sheet) {
        await transaction.rollback();
        return responseTemplates.setNotFoundResponse(
          RESPONSE_MESSAGES.DATA_NOT_FOUND,
        );
      }

      const existing = await models.SheetsReviews.findOne({
        where: {
          sheet_id: id,
          user_id: req.user.id,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      const review = existing
        ? await existing.update(
            {
              score,
              content,
              visible_flag: true,
              status_flag: "ACTIVE",
              updated_by: req.user.id,
            },
            { transaction },
          )
        : await models.SheetsReviews.create(
            {
              sheet_id: id,
              user_id: req.user.id,
              score,
              content,
              created_by: req.user.id,
            },
            { transaction },
          );

      await recalculateSheetRating(id, transaction);
      await transaction.commit();

      const withUser = await models.SheetsReviews.findOne({
        where: { id: review.id },
        include: [
          {
            model: models.Users,
            as: "user",
            attributes: ["id", "username", "profile_image"],
          },
        ],
      });

      return (
        existing
          ? responseTemplates.setOKResponse
          : responseTemplates.setCreatedResponse
      )({
        review: mapReview(withUser),
      });
    } catch (error) {
      await transaction.rollback();
      console.log(error);
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  },

  async updateReview(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { id, reviewId } = req.params;
      const hasScore = Object.prototype.hasOwnProperty.call(req.body, "score");
      const score = Number(req.body.score);
      const content = Object.prototype.hasOwnProperty.call(req.body, "content")
        ? req.body.content
        : undefined;

      if (hasScore && (!Number.isInteger(score) || score < 1 || score > 5)) {
        await transaction.rollback();
        return responseTemplates.setBadRequestResponse(
          RESPONSE_MESSAGES.BAD_REQUEST,
        );
      }

      const review = await models.SheetsReviews.findOne({
        where: {
          id: reviewId,
          sheet_id: id,
          visible_flag: {
            [Op.ne]: false,
          },
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!review) {
        await transaction.rollback();
        return responseTemplates.setNotFoundResponse(
          RESPONSE_MESSAGES.DATA_NOT_FOUND,
        );
      }

      const isAdmin = await isAdminRole(req.user.role_id, transaction);
      if (review.user_id !== req.user.id && !isAdmin) {
        await transaction.rollback();
        return responseTemplates.setForbiddenResponse(
          message("ไม่มีสิทธิ์แก้ไขรีวิวนี้", "You cannot update this review."),
        );
      }

      await review.update(
        {
          ...(hasScore ? { score } : {}),
          ...(content !== undefined ? { content } : {}),
          updated_by: req.user.id,
        },
        { transaction },
      );
      await recalculateSheetRating(id, transaction);
      await transaction.commit();

      const withUser = await models.SheetsReviews.findOne({
        where: { id: reviewId },
        include: [
          {
            model: models.Users,
            as: "user",
            attributes: ["id", "username", "profile_image"],
          },
        ],
      });

      return responseTemplates.setOKResponse({
        review: mapReview(withUser),
      });
    } catch (error) {
      await transaction.rollback();
      console.log(error);
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  },

  async deleteReview(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { id, reviewId } = req.params;
      const review = await models.SheetsReviews.findOne({
        where: {
          id: reviewId,
          sheet_id: id,
          visible_flag: {
            [Op.ne]: false,
          },
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!review) {
        await transaction.rollback();
        return responseTemplates.setNotFoundResponse(
          RESPONSE_MESSAGES.DATA_NOT_FOUND,
        );
      }

      const isAdmin = await isAdminRole(req.user.role_id, transaction);
      if (review.user_id !== req.user.id && !isAdmin) {
        await transaction.rollback();
        return responseTemplates.setForbiddenResponse(
          message("ไม่มีสิทธิ์ลบรีวิวนี้", "You cannot delete this review."),
        );
      }

      await review.update(
        {
          visible_flag: false,
          status_flag: "INACTIVE",
          updated_by: req.user.id,
          status_modified_at: new Date(),
        },
        { transaction },
      );
      await recalculateSheetRating(id, transaction);
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
};
