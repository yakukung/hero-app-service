import { service as revenueService } from "../services/revenue.services.js";

export const controller = {
  async getCreatorRevenue(req, res) {
    try {
      const result = await revenueService.getCreatorRevenue(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
};
