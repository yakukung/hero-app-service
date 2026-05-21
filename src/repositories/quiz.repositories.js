import { Op, fn, col, literal } from "sequelize";
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

  async findLeaderboardBySheetId(sheetId) {
    const questions = await models.SheetsQuestions.findAll({
      attributes: ["id"],
      where: {
        sheet_id: sheetId,
        visible_flag: { [Op.ne]: false },
        status_flag: "ACTIVE",
      },
    });

    if (questions.length === 0) {
      return [];
    }

    const questionIds = questions.map((q) => q.id);

    const results = await models.UsersSheetsAnswers.findAll({
      attributes: [
        "user_id",
        [
          fn(
            "COUNT",
            literal("CASE WHEN is_correct = true THEN 1 END"),
          ),
          "correct_count",
        ],
      ],
      where: {
        question_id: { [Op.in]: questionIds },
        visible_flag: { [Op.ne]: false },
        status_flag: "ACTIVE",
      },
      include: [
        {
          model: models.Users,
          as: "user",
          attributes: ["id", "username", "profile_image"],
          required: true,
          where: {
            visible_flag: { [Op.ne]: false },
            status_flag: "ACTIVE",
          },
        },
      ],
      group: ["user_id", "user.id", "user.username", "user.profile_image"],
      order: [[literal("correct_count"), "DESC"]],
      limit: 50,
      subQuery: false,
    });

    return results.map((r) => {
      const plain = r.get({ plain: true });
      return {
        user_id: plain.user_id,
        username: plain.user?.username || "",
        profile_image: plain.user?.profile_image || null,
        correct_count: Number(plain.correct_count),
      };
    });
  },
};
