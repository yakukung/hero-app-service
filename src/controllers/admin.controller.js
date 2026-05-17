const adminService = require("../services/admin.service");

const adminController = {
  getDashboard: async (req, res) => {
    try {
      const result = await adminService.getDashboard();
      return res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.error("Error in getDashboard:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const { page = 1, limit = 20, search = "" } = req.query;

      const result = await adminService.getAllUsers({ page, limit, search });
      return res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.error("Error in getAllUsers:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  getUserById: async (req, res) => {
    try {
      const { userId } = req.params;

      const result = await adminService.getUserById(userId);
      return res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.error("Error in getUserById:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  updateUserStatus: async (req, res) => {
    try {
      const { userId } = req.params;
      const { status } = req.body;

      const result = await adminService.updateUserStatus(userId, status);
      return res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.error("Error in updateUserStatus:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  getAllSheets: async (req, res) => {
    try {
      const { page = 1, limit = 20, search = "", status = "" } = req.query;

      const result = await adminService.getAllSheets({ page, limit, search, status });
      return res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.error("Error in getAllSheets:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  updateSheetStatus: async (req, res) => {
    try {
      const { sheetId } = req.params;
      const { status } = req.body;

      const result = await adminService.updateSheetStatus(sheetId, status);
      return res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.error("Error in updateSheetStatus:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  getAllPayments: async (req, res) => {
    try {
      const { page = 1, limit = 20, status = "", startDate = "", endDate = "" } = req.query;

      const result = await adminService.getAllPayments({ page, limit, status, startDate, endDate });
      return res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.error("Error in getAllPayments:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  updatePaymentStatus: async (req, res) => {
    try {
      const { paymentId } = req.params;
      const { status } = req.body;

      const result = await adminService.updatePaymentStatus(paymentId, status);
      return res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.error("Error in updatePaymentStatus:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  getAllSubscriptions: async (req, res) => {
    try {
      const { page = 1, limit = 20, status = "" } = req.query;

      const result = await adminService.getAllSubscriptions({ page, limit, status });
      return res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.error("Error in getAllSubscriptions:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  updateSubscriptionStatus: async (req, res) => {
    try {
      const { subscriptionId } = req.params;
      const { status } = req.body;

      const result = await adminService.updateSubscriptionStatus(subscriptionId, status);
      return res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.error("Error in updateSubscriptionStatus:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  getAllTopUps: async (req, res) => {
    try {
      const { page = 1, limit = 20, status = "" } = req.query;

      const result = await adminService.getAllTopUps({ page, limit, status });
      return res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.error("Error in getAllTopUps:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  approveTopUp: async (req, res) => {
    try {
      const { topUpId } = req.params;

      const result = await adminService.approveTopUp(topUpId);
      return res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.error("Error in approveTopUp:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  rejectTopUp: async (req, res) => {
    try {
      const { topUpId } = req.params;
      const { reason } = req.body;

      const result = await adminService.rejectTopUp(topUpId, reason);
      return res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.error("Error in rejectTopUp:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  getAllReports: async (req, res) => {
    try {
      const { page = 1, limit = 20, status = "" } = req.query;

      const result = await adminService.getAllReports({ page, limit, status });
      return res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.error("Error in getAllReports:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  updateReportStatus: async (req, res) => {
    try {
      const { reportId } = req.params;
      const { status, resolution } = req.body;

      const result = await adminService.updateReportStatus(reportId, status, resolution);
      return res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.error("Error in updateReportStatus:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  getRevenueStats: async (req, res) => {
    try {
      const { startDate, endDate, period = "daily" } = req.query;

      const result = await adminService.getRevenueStats({ startDate, endDate, period });
      return res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.error("Error in getRevenueStats:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
};

module.exports = adminController;
