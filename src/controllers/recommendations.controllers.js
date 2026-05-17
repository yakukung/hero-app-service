import { service as recommendationsService } from "../services/recommendations.services.js";

export const controller = {
  async list(req, res) {
    try {
      const result = await recommendationsService.list(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
};
