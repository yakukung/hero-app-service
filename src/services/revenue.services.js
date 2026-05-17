import { Op } from "sequelize";
import { repository as revenueRepository } from "../repositories/revenue.repositories.js";
import { responseTemplates } from "../utils/response.utils.js";
import { toNumber, toPlain } from "../utils/backend.utils.js";

const CREATOR_SHARE = 0.6;
const PLATFORM_SHARE = 0.4;

const revenueWhere = {
  payment_status: "SUCCESSFUL",
  visible_flag: {
    [Op.ne]: false,
  },
};

const monthKey = (date) => new Date(date).toISOString().slice(0, 7);

const summarizeMonthly = (payments) => {
  const groups = new Map();
  for (const payment of payments) {
    const key = monthKey(payment.created_at);
    const current = groups.get(key) || {
      month: key,
      gross: 0,
      creator_share: 0,
      platform_share: 0,
    };
    const gross = toNumber(payment.amount);
    current.gross += gross;
    current.creator_share += gross * CREATOR_SHARE;
    current.platform_share += gross * PLATFORM_SHARE;
    groups.set(key, current);
  }
  return Array.from(groups.values()).sort((a, b) => b.month.localeCompare(a.month));
};

export const service = {
  async getCreatorRevenue(req) {
    const rows = await revenueRepository.findCreatorRevenuePayments(
      req.user.id,
      revenueWhere,
    );

    const payments = rows.map(toPlain);
    const daily = payments.map((payment) => ({
      id: payment.id,
      sheet_id: payment.sheet_id,
      sheet_title: payment.sheet?.title,
      amount: toNumber(payment.amount) * CREATOR_SHARE,
      gross_amount: toNumber(payment.amount),
      buyer_id: payment.user_id,
      buyer_name: payment.user?.username,
      created_at: payment.created_at,
    }));

    return responseTemplates.setOKResponse({
      total: daily.reduce((sum, item) => sum + item.amount, 0),
      daily,
      monthly: summarizeMonthly(payments).map((item) => ({
        month: item.month,
        amount: item.creator_share,
        gross: item.gross,
      })),
    });
  },

  async getAdminRevenue() {
    const rows = await revenueRepository.findAdminRevenuePayments(revenueWhere);

    const payments = rows.map(toPlain);
    const gross = payments.reduce(
      (sum, payment) => sum + toNumber(payment.amount),
      0,
    );
    const sheetTotals = new Map();
    for (const payment of payments) {
      const current = sheetTotals.get(payment.sheet_id) || {
        sheet_id: payment.sheet_id,
        sheet_title: payment.sheet?.title,
        creator_id: payment.sheet?.author_id,
        creator_name: payment.sheet?.author?.username,
        gross: 0,
        purchases: 0,
      };
      current.gross += toNumber(payment.amount);
      current.purchases += 1;
      sheetTotals.set(payment.sheet_id, current);
    }

    return responseTemplates.setOKResponse({
      gross_revenue: gross,
      creator_share: gross * CREATOR_SHARE,
      platform_share: gross * PLATFORM_SHARE,
      top_sheets: Array.from(sheetTotals.values())
        .sort((a, b) => b.gross - a.gross)
        .slice(0, 10),
      monthly: summarizeMonthly(payments),
    });
  },
};
