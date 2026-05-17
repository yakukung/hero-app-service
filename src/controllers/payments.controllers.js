import { service as paymentsService } from "../services/payments.services.js";

export const controller = {
  async getHistory(req, res) {
    try {
      const result = await paymentsService.getHistory(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
};
