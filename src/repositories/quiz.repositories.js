import { Op } from "sequelize";
import { models } from "../models/sequelize/associations.js";

export const repository = {
  async findVisibleSheetById(sheetId, transaction = undefined) {
    return models.Sheets.findOne({
      attributes: ["id"],
      where: {
        id: sheetId,
        visible_flag: {
          [Op.ne]: false,
        },
      },
      transaction,
    });
  },

  async findSheetQuestionsWithAnswers(sheetId, transaction = undefined) {
    return models.SheetsQuestions.findAll({
      where: {
        sheet_id: sheetId,
        visible_flag: {
          [Op.ne]: false,
        },
        status_flag: "ACTIVE",
      },
      include: [
        {
          model: models.SheetsAnswers,
          as: "answers",
          where: {
            visible_flag: {
              [Op.ne]: false,
            },
            status_flag: "ACTIVE",
          },
          required: false,
        },
      ],
      order: [
        ["index", "ASC"],
        [{ model: models.SheetsAnswers, as: "answers" }, "index", "ASC"],
      ],
      transaction,
    });
  },

  async findUserAnswersByQuestionIds(userId, questionIds) {
    return models.UsersSheetsAnswers.findAll({
      where: {
        user_id: userId,
        question_id: questionIds,
        visible_flag: {
          [Op.ne]: false,
        },
        status_flag: "ACTIVE",
      },
      order: [["updated_at", "DESC"], ["created_at", "DESC"]],
    });
  },

  async findUserAnswerForUpdate(userId, questionId, transaction) {
    return models.UsersSheetsAnswers.findOne({
      where: {
        user_id: userId,
        question_id: questionId,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
  },

  async updateUserAnswer(userAnswer, payload, transaction) {
    return userAnswer.update(payload, { transaction });
  },

  async createUserAnswer(payload, transaction) {
    return models.UsersSheetsAnswers.create(payload, { transaction });
  },
};
