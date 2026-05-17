import { service as reportsService } from "../services/reports.services.js";

export const controller = {
  async submit(req, res) {
    try {
      const result = await reportsService.submit(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
};
