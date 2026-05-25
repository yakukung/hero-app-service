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

  async getSubscriptions(req, res) {
    try {
      const result = await adminService.getSubscriptions(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  async getReports(req, res) {
    try {
      const result = await adminService.getReports(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  async updateReportStatus(req, res) {
    try {
      const result = await adminService.updateReportStatus(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  async reportAction(req, res) {
    try {
      const result = await adminService.reportAction(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  async updatePostStatus(req, res) {
    try {
      const result = await adminService.updatePostStatus(req, res);
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

  async getSheetReviews(req, res) {
    try {
      const result = await adminService.getSheetReviews(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  async updateReviewStatus(req, res) {
    try {
      const result = await adminService.updateReviewStatus(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  async getPostComments(req, res) {
    try {
      const result = await adminService.getPostComments(req, res);
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

  async updateUserUsername(req, res) {
    try {
      const result = await adminService.updateUserUsername(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  async updateUserEmail(req, res) {
    try {
      const result = await adminService.updateUserEmail(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  async updateUserPassword(req, res) {
    try {
      const result = await adminService.updateUserPassword(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  async updatePlan(req, res) {
    try {
      const result = await adminService.updatePlan(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
};
