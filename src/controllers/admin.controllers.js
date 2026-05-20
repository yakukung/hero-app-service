import { service as adminService } from "../services/admin.services.js";

export const controller = {
  async getPayments(req, res) {
    try {
      const result = await adminService.getPayments(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  async updateWalletTopUpStatus(req, res) {
    try {
      const result = await adminService.updateWalletTopUpStatus(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  async updateSubscriptionStatus(req, res) {
    try {
      const result = await adminService.updateSubscriptionStatus(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  async updateSheetPurchaseStatus(req, res) {
    try {
      const result = await adminService.updateSheetPurchaseStatus(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  async getSheets(req, res) {
    try {
      const result = await adminService.getSheets(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  async getSheetById(req, res) {
    try {
      const result = await adminService.getSheetById(req);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  async updateSheetStatus(req, res) {
    try {
      const result = await adminService.updateSheetStatus(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  async updateCommentStatus(req, res) {
    try {
      const result = await adminService.updateCommentStatus(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  async getRevenue(req, res) {
    try {
      const result = await adminService.getRevenue(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
};
