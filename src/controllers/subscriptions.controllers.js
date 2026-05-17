import { service as subscriptionsService } from "../services/subscriptions.services.js";

export const controller = {
  async getPlans(req, res) {
    try {
      const result = await subscriptionsService.getPlans(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  async getMe(req, res) {
    try {
      const result = await subscriptionsService.getMe(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  async createSubscription(req, res) {
    try {
      const result = await subscriptionsService.createSubscription(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
};
