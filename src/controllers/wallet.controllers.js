import { service as walletService } from "../services/wallet.services.js";

export const controller = {
  async getTopUps(req, res) {
    try {
      const result = await walletService.getTopUps(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  async createTopUp(req, res) {
    try {
      const result = await walletService.createTopUp(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
};
