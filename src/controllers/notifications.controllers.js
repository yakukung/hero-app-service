import { service as notificationsService } from "../services/notifications.services.js";

export const controller = {
  async list(req, res) {
    try {
      const result = await notificationsService.list(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  async markRead(req, res) {
    try {
      const result = await notificationsService.markRead(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
};
