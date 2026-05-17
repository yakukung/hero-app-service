import { service as quizService } from "../services/quiz.services.js";

export const controller = {
  async submitResult(req, res) {
    try {
      const result = await quizService.submitResult(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  async getResult(req, res) {
    try {
      const result = await quizService.getResult(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
};
