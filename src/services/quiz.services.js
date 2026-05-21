import { sequelize } from "../configs/sequelize.configs.js";
import { RESPONSE_MESSAGES } from "../constants/response.constant.js";
import { repository as quizRepository } from "../repositories/quiz.repositories.js";
import { message, toPlain } from "../utils/backend.utils.js";
import { responseTemplates } from "../utils/response.utils.js";

const loadQuestions = (sheetId, transaction = undefined) =>
  quizRepository.findSheetQuestionsWithAnswers(sheetId, transaction);

const selectByIndexOrPosition = (items, value) => {
  const normalized = Number(value);
  return (
    items.find((item) => Number(item.index) === normalized) ||
    items[normalized] ||
    null
  );
};

const summarizeAnswers = async (userId, sheetId) => {
  const questions = await loadQuestions(sheetId);
  if (questions.length === 0) {
    return {
      best_score: 0,
      latest_score: 0,
      total_questions: 0,
      points_earned: 0,
      attempts: 0,
      latest_at: null,
    };
  }

  const answers = await quizRepository.findUserAnswersByQuestionIds(
    userId,
    questions.map((question) => question.id),
  );

  const score = answers.filter((answer) => answer.is_correct).length;
  const latestAt =
    answers.length > 0
      ? answers.reduce((latest, answer) => {
          const candidate = answer.updated_at || answer.created_at;
          return !latest || new Date(candidate) > new Date(latest)
            ? candidate
            : latest;
        }, null)
      : null;

  return {
    best_score: score,
    latest_score: score,
    total_questions: questions.length,
    points_earned: score,
    attempts: answers.length > 0 ? 1 : 0,
    latest_at: latestAt,
  };
};

export const service = {
  async submitResult(req) {
    const transaction = await sequelize.transaction();
    try {
      const { sheet_id, answers } = req.body;
      if (!sheet_id || !answers || typeof answers !== "object") {
        await transaction.rollback();
        return responseTemplates.setBadRequestResponse(RESPONSE_MESSAGES.BAD_REQUEST);
      }

      const sheet = await quizRepository.findVisibleSheetById(
        sheet_id,
        transaction,
      );

      if (!sheet) {
        await transaction.rollback();
        return responseTemplates.setNotFoundResponse(
          RESPONSE_MESSAGES.DATA_NOT_FOUND,
        );
      }

      const questions = await loadQuestions(sheet_id, transaction);
      if (questions.length === 0) {
        await transaction.rollback();
        return responseTemplates.setBadRequestResponse(
          message("ชีตนี้ยังไม่มีคำถาม", "This sheet has no questions."),
        );
      }

      let score = 0;
      let savedCount = 0;
      for (const [questionKey, answerValue] of Object.entries(answers)) {
        const question = selectByIndexOrPosition(questions, questionKey);
        if (!question) continue;

        const questionPlain = toPlain(question);
        const selectedAnswer = selectByIndexOrPosition(
          questionPlain.answers || [],
          answerValue,
        );
        if (!selectedAnswer) continue;

        const isCorrect = Boolean(selectedAnswer.is_correct);
        if (isCorrect) score += 1;

        const existing = await quizRepository.findUserAnswerForUpdate(
          req.user.id,
          question.id,
          transaction,
        );

        if (existing) {
          await quizRepository.updateUserAnswer(
            existing,
            {
              selected_answer_id: selectedAnswer.id,
              is_correct: isCorrect,
              visible_flag: true,
              status_flag: "ACTIVE",
              updated_by: req.user.id,
            },
            transaction,
          );
        } else {
          await quizRepository.createUserAnswer(
            {
              user_id: req.user.id,
              question_id: question.id,
              selected_answer_id: selectedAnswer.id,
              is_correct: isCorrect,
              created_by: req.user.id,
            },
            transaction,
          );
        }

        savedCount += 1;
      }

      await transaction.commit();
      return responseTemplates.setCreatedResponse({
        id: `${req.user.id}:${sheet_id}`,
        sheet_id,
        score,
        total_questions: questions.length,
        elapsed_seconds: Number(req.body.elapsed_seconds) || null,
        points_earned: score,
        saved_answers: savedCount,
      });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  },

  async getResult(req) {
    const { sheetId } = req.params;
    const sheet = await quizRepository.findVisibleSheetById(sheetId);

    if (!sheet) {
      return responseTemplates.setNotFoundResponse(RESPONSE_MESSAGES.DATA_NOT_FOUND);
    }

    return responseTemplates.setOKResponse(
      await summarizeAnswers(req.user.id, sheetId),
    );
  },

  async getLeaderboard(req) {
    const { sheetId } = req.params;
    const sheet = await quizRepository.findVisibleSheetById(sheetId);

    if (!sheet) {
      return responseTemplates.setNotFoundResponse(RESPONSE_MESSAGES.DATA_NOT_FOUND);
    }

    const questions = await loadQuestions(sheetId);
    const totalQuestions = questions.length;

    if (totalQuestions === 0) {
      return responseTemplates.setOKResponse({
        total_questions: 0,
        leaderboard: [],
      });
    }

    const leaderboard = await quizRepository.findLeaderboardBySheetId(sheetId);

    return responseTemplates.setOKResponse({
      total_questions: totalQuestions,
      leaderboard,
    });
  },
};
