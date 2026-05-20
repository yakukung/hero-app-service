import { sequelize } from "../configs/sequelize.configs.js";
import { RESPONSE_MESSAGES } from "../constants/response.constant.js";
import { repository as adminRepository } from "../repositories/admin.repositories.js";
import { mapping as sheetsMapping } from "../models/mapping/sheets.mapping.js";
import { activateSubscriptionPayment } from "./subscriptions.services.js";
import { service as revenueService } from "./revenue.services.js";
import {
  formatPayment,
  message,
  sortByCreatedAtDesc,
  toNumber,
  toPlain,
} from "../utils/backend.utils.js";
import { responseTemplates } from "../utils/response.utils.js";

const allowedPaymentStatuses = ["PENDING", "SUCCESSFUL", "FAILED", "REFUNDED"];
const allowedReportStatuses = ["PENDING", "REVIEWING", "RESOLVED", "REJECTED"];
const allowedContentStatuses = ["ACTIVE", "INACTIVE"];

const reportTargets = {
  posts: {
    reportKey: "post_id",
  },
  sheets: {
    reportKey: "sheet_id",
  },
  users: {
    reportKey: "user_id",
  },
};

const mapAdminReport = (row, referenceTable, referenceKey) => {
  const report = toPlain(row);
  return {
    id: report.id,
    reference_table: referenceTable,
    reference_id: report[referenceKey],
    report_type: report.report_type,
    content: report.content,
    status_flag: report.status_flag,
    reporter_id: report.reporter_id,
    reporter_name: report.reporter?.username,
    created_at: report.created_at,
    updated_at: report.updated_at,
  };
};

const mapAdminSubscription = (row) => {
  const subscription = toPlain(row);
  return {
    id: subscription.id,
    user_id: subscription.user_id,
    username: subscription.user?.username,
    plan_id: subscription.plan_id,
    plan_name: subscription.plan?.name,
    start_at: subscription.start_at,
    expires_at: subscription.expires_at,
    auto_renew: subscription.auto_renew,
    status_flag: subscription.status_flag,
    created_at: subscription.created_at,
  };
};

const mapAdminSheet = (row) => {
  const sheet = toPlain(row);
  const successfulPayments = Array.isArray(sheet.payments) ? sheet.payments : [];
  const buyerCount = new Set(
    successfulPayments.map((payment) => payment.user_id).filter(Boolean),
  ).size;

  return {
    id: sheet.id,
    author_id: sheet.author_id,
    title: sheet.title,
    description: sheet.description,
    price: toNumber(sheet.price),
    buyer_count: buyerCount,
    author_name: sheet.author?.username || null,
    created_at: sheet.created_at,
    visible_flag: sheet.visible_flag,
    status_flag: sheet.status_flag,
    flag: {
      visible_flag: sheet.visible_flag,
      status_flag: sheet.status_flag,
    },
  };
};

const mapAdminPaymentUser = (payment, user) => ({
  user_id: payment.user_id,
  username: user?.username,
  email: user?.email,
});

export const service = {
  async getPayments() {
    const [topUps, planPayments, sheetPayments] = await Promise.all([
      adminRepository.findAllWalletTopupsWithUsers(),
      adminRepository.findAllBuyPlansWithUsersAndPlan(),
      adminRepository.findAllBuySheetsWithUsersAndSheet(),
    ]);

    const payments = [
      ...topUps.map((row) => {
        const item = toPlain(row);
        return {
          ...formatPayment({
            id: item.id,
            title: "เติมเงิน E-Wallet",
            reference_table: "wallet_topups",
            reference_id: item.id,
            amount: item.amount,
            payment_status: item.payment_status,
            created_at: item.created_at,
            type: "WALLET_TOPUP",
            slip_image_url: item.slip_image_url,
          }),
          ...mapAdminPaymentUser(item, item.user),
        };
      }),
      ...planPayments.map((row) => {
        const item = toPlain(row);
        return {
          ...formatPayment({
            id: item.id,
            title: item.plan?.name || "Subscription",
            reference_table: "buy_plans",
            reference_id: item.plan_id,
            amount: item.amount,
            payment_status: item.payment_status,
            created_at: item.created_at,
            type: "SUBSCRIPTION",
            slip_image_url: item.slip_image_url,
          }),
          ...mapAdminPaymentUser(item, item.user),
        };
      }),
      ...sheetPayments.map((row) => {
        const item = toPlain(row);
        return {
          ...formatPayment({
            id: item.id,
            title: item.sheet?.title || "Sheet purchase",
            reference_table: "buy_sheets",
            reference_id: item.sheet_id,
            amount: item.amount,
            payment_status: item.payment_status,
            created_at: item.created_at,
            type: "SHEET_PURCHASE",
            slip_image_url: item.slip_image_url,
          }),
          ...mapAdminPaymentUser(item, item.user),
        };
      }),
    ];

    return responseTemplates.setOKResponse({
      payments: sortByCreatedAtDesc(payments),
    });
  },

  async updateWalletTopUpStatus(req) {
    const transaction = await sequelize.transaction();
    try {
      const { payment_status } = req.body;
      if (!allowedPaymentStatuses.includes(payment_status)) {
        await transaction.rollback();
        return responseTemplates.setBadRequestResponse(
          RESPONSE_MESSAGES.BAD_REQUEST,
        );
      }

      const topUp = await adminRepository.findWalletTopupByIdForUpdate(
        req.params.id,
        transaction,
      );

      if (!topUp) {
        await transaction.rollback();
        return responseTemplates.setNotFoundResponse(
          RESPONSE_MESSAGES.DATA_NOT_FOUND,
        );
      }

      const previousStatus = topUp.payment_status;
      await adminRepository.updateWalletTopup(
        topUp,
        {
          payment_status,
          updated_by: req.user.id,
          status_modified_at: new Date(),
        },
        transaction,
      );

      const decreaseStatuses = ["REFUNDED", "FAILED", "PENDING"];
      const isBecomingSuccessful =
        previousStatus !== "SUCCESSFUL" && payment_status === "SUCCESSFUL";
      const isLeavingSuccessful =
        previousStatus === "SUCCESSFUL" &&
        decreaseStatuses.includes(payment_status);

      if (isBecomingSuccessful || isLeavingSuccessful) {
        const user = await adminRepository.findUserByIdForUpdate(
          topUp.user_id,
          transaction,
        );
        if (!user) {
          await transaction.rollback();
          return responseTemplates.setNotFoundResponse(
            RESPONSE_MESSAGES.DATA_NOT_FOUND,
          );
        }

        const amount = toNumber(topUp.amount);
        const currentWallet = toNumber(user.total_wallet);
        const nextWallet = isBecomingSuccessful
          ? currentWallet + amount
          : currentWallet - amount;

        await adminRepository.updateUser(
          user,
          {
            total_wallet: nextWallet,
            updated_by: req.user.id,
          },
          transaction,
        );
      }

      await transaction.commit();
      return responseTemplates.setOKResponse({
        id: topUp.id,
        payment_status,
      });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  },

  async updateSubscriptionStatus(req) {
    const transaction = await sequelize.transaction();
    try {
      const { payment_status } = req.body;
      if (!allowedPaymentStatuses.includes(payment_status)) {
        await transaction.rollback();
        return responseTemplates.setBadRequestResponse(
          RESPONSE_MESSAGES.BAD_REQUEST,
        );
      }

      const payment = await adminRepository.findBuyPlanByIdForUpdate(
        req.params.id,
        transaction,
      );

      if (!payment) {
        await transaction.rollback();
        return responseTemplates.setNotFoundResponse(
          RESPONSE_MESSAGES.DATA_NOT_FOUND,
        );
      }

      const previousStatus = payment.payment_status;
      await adminRepository.updateBuyPlan(
        payment,
        {
          payment_status,
          updated_by: req.user.id,
          status_modified_at: new Date(),
        },
        transaction,
      );

      if (previousStatus !== "SUCCESSFUL" && payment_status === "SUCCESSFUL") {
        await activateSubscriptionPayment(payment, req.user.id, transaction);
      }

      await transaction.commit();
      return responseTemplates.setOKResponse({
        id: payment.id,
        payment_status,
      });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  },

  async updateSheetPurchaseStatus(req) {
    const { payment_status } = req.body;
    if (!allowedPaymentStatuses.includes(payment_status)) {
      return responseTemplates.setBadRequestResponse(
        RESPONSE_MESSAGES.BAD_REQUEST,
      );
    }

    const [affected] = await adminRepository.updateBuySheetById(req.params.id, {
      payment_status,
      updated_by: req.user.id,
      status_modified_at: new Date(),
    });

    if (affected === 0) {
      return responseTemplates.setNotFoundResponse(
        RESPONSE_MESSAGES.DATA_NOT_FOUND,
      );
    }

    return responseTemplates.setOKResponse({
      id: req.params.id,
      payment_status,
    });
  },

  async getSheets() {
    const sheets = await adminRepository.findAllSheetsForAdmin();
    return responseTemplates.setOKResponse({
      sheets: sheets.map(mapAdminSheet),
    });
  },

  async getSheetById(req) {
    try {
      const sheet = await adminRepository.findSheetByIdForAdmin(
        req.params.id,
      );
      if (!sheet) {
        return responseTemplates.setNotFoundResponse(
          RESPONSE_MESSAGES.DATA_NOT_FOUND,
        );
      }
      const mapped = await sheetsMapping.mapSheetDetail(sheet.dataValues);
      return responseTemplates.setOKResponse(mapped);
    } catch (error) {
      console.error(error);
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  },

  async getSubscriptions() {
    const [payments, activeSubscriptions] = await Promise.all([
      adminRepository.findAllBuyPlanPayments(),
      adminRepository.findAllActiveSubscriptions(),
    ]);

    return responseTemplates.setOKResponse({
      payments: payments.map((row) => {
        const payment = toPlain(row);
        return {
          id: payment.id,
          user_id: payment.user_id,
          username: payment.user?.username,
          plan_id: payment.plan_id,
          plan_name: payment.plan?.name,
          amount: toNumber(payment.amount),
          payment_status: payment.payment_status,
          slip_image_url: payment.slip_image_url,
          created_at: payment.created_at,
        };
      }),
      subscriptions: activeSubscriptions.map(mapAdminSubscription),
    });
  },

  async getReports() {
    const [postReports, sheetReports, userReports] = await Promise.all([
      adminRepository.findAllPostReports(),
      adminRepository.findAllSheetReports(),
      adminRepository.findAllUserReports(),
    ]);

    const reports = [
      ...postReports.map((row) => mapAdminReport(row, "posts", "post_id")),
      ...sheetReports.map((row) => mapAdminReport(row, "sheets", "sheet_id")),
      ...userReports.map((row) => mapAdminReport(row, "users", "user_id")),
    ];

    return responseTemplates.setOKResponse({
      reports: sortByCreatedAtDesc(reports),
    });
  },

  async updateReportStatus(req) {
    const { reference_table, status_flag } = req.body;
    const config = reportTargets[String(reference_table || "").toLowerCase()];
    if (!config || !allowedReportStatuses.includes(status_flag)) {
      return responseTemplates.setBadRequestResponse(
        RESPONSE_MESSAGES.BAD_REQUEST,
      );
    }

    const [affected] = await adminRepository.updateReportStatusByTable(
      reference_table,
      req.params.id,
      {
        status_flag,
        updated_by: req.user.id,
        status_modified_at: new Date(),
      },
    );

    if (affected === 0) {
      return responseTemplates.setNotFoundResponse(
        RESPONSE_MESSAGES.DATA_NOT_FOUND,
      );
    }

    return responseTemplates.setOKResponse({
      id: req.params.id,
      reference_table,
      status_flag,
    });
  },

  async reportAction(req) {
    const transaction = await sequelize.transaction();
    try {
      const { reference_table, action } = req.body;
      const normalizedTable = String(reference_table || "").toLowerCase();
      const config = reportTargets[normalizedTable];
      const allowedActions = ["HIDE", "RESTORE", "DELETE", "SUSPEND_USER"];

      if (!config || !allowedActions.includes(action)) {
        await transaction.rollback();
        return responseTemplates.setBadRequestResponse(
          RESPONSE_MESSAGES.BAD_REQUEST,
        );
      }

      const report = await adminRepository.findReportByTableAndId(
        normalizedTable,
        req.params.id,
        transaction,
      );

      if (!report) {
        await transaction.rollback();
        return responseTemplates.setNotFoundResponse(
          RESPONSE_MESSAGES.DATA_NOT_FOUND,
        );
      }

      const targetId = report[config.reportKey];
      const updateByAction = {
        HIDE: { visible_flag: false, status_flag: "INACTIVE" },
        DELETE: { visible_flag: false, status_flag: "INACTIVE" },
        RESTORE: { visible_flag: true, status_flag: "ACTIVE" },
        SUSPEND_USER: { visible_flag: false, status_flag: "SUSPENDED" },
      };

      if (action === "SUSPEND_USER" && normalizedTable !== "users") {
        await transaction.rollback();
        return responseTemplates.setBadRequestResponse(
          message(
            "SUSPEND_USER ใช้ได้กับ user report เท่านั้น",
            "SUSPEND_USER only applies to user reports.",
          ),
        );
      }

      await adminRepository.updateTargetByTable(
        normalizedTable,
        targetId,
        {
          ...updateByAction[action],
          updated_by: req.user.id,
          status_modified_at: new Date(),
        },
        transaction,
      );

      await adminRepository.updateReport(
        report,
        {
          status_flag: "RESOLVED",
          updated_by: req.user.id,
          status_modified_at: new Date(),
        },
        transaction,
      );

      await transaction.commit();
      return responseTemplates.setOKResponse({
        id: req.params.id,
        reference_table: normalizedTable,
        reference_id: targetId,
        action,
        status_flag: "RESOLVED",
      });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  },

  async updatePostStatus(req) {
    const { status_flag } = req.body;
    if (!allowedContentStatuses.includes(status_flag)) {
      return responseTemplates.setBadRequestResponse(
        RESPONSE_MESSAGES.BAD_REQUEST,
      );
    }

    const [affected] = await adminRepository.updatePostById(req.params.id, {
      status_flag,
      visible_flag: status_flag === "ACTIVE",
      updated_by: req.user.id,
      status_modified_at: new Date(),
    });

    if (affected === 0) {
      return responseTemplates.setNotFoundResponse(
        RESPONSE_MESSAGES.DATA_NOT_FOUND,
      );
    }

    return responseTemplates.setOKResponse({
      id: req.params.id,
      status_flag,
      visible_flag: status_flag === "ACTIVE",
    });
  },

  async updateSheetStatus(req) {
    const { status_flag } = req.body;
    if (!allowedContentStatuses.includes(status_flag)) {
      return responseTemplates.setBadRequestResponse(
        RESPONSE_MESSAGES.BAD_REQUEST,
      );
    }

    const [affected] = await adminRepository.updateSheetById(req.params.id, {
      status_flag,
      visible_flag: status_flag === "ACTIVE",
      updated_by: req.user.id,
      status_modified_at: new Date(),
    });

    if (affected === 0) {
      return responseTemplates.setNotFoundResponse(
        RESPONSE_MESSAGES.DATA_NOT_FOUND,
      );
    }

    return responseTemplates.setOKResponse({
      id: req.params.id,
      status_flag,
      visible_flag: status_flag === "ACTIVE",
    });
  },

  async updateCommentStatus(req) {
    const { status_flag } = req.body;
    if (!allowedContentStatuses.includes(status_flag)) {
      return responseTemplates.setBadRequestResponse(
        RESPONSE_MESSAGES.BAD_REQUEST,
      );
    }

    const [affected] = await adminRepository.updatePostCommentById(
      req.params.id,
      {
        status_flag,
        visible_flag: status_flag === "ACTIVE",
        updated_by: req.user.id,
        status_modified_at: new Date(),
      },
    );

    if (affected === 0) {
      return responseTemplates.setNotFoundResponse(
        RESPONSE_MESSAGES.DATA_NOT_FOUND,
      );
    }

    return responseTemplates.setOKResponse({
      id: req.params.id,
      status_flag,
      visible_flag: status_flag === "ACTIVE",
    });
  },

  async getRevenue(req, res) {
    return revenueService.getAdminRevenue(req, res);
  },
};
