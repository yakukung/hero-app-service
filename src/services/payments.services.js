import { responseTemplates } from "../utils/response.utils.js";
import { formatPayment, sortByCreatedAtDesc, toPlain } from "../utils/backend.utils.js";
import { repository as paymentsRepository } from "../repositories/payments.repositories.js";

export const service = {
  async getHistory(req) {
    const [topUps, planPayments, sheetPayments] = await Promise.all([
      paymentsRepository.findWalletTopupsByUser(req.user.id),
      paymentsRepository.findPlanPaymentsByUser(req.user.id),
      paymentsRepository.findSheetPaymentsByUser(req.user.id),
    ]);

    const payments = [
      ...topUps.map((row) => {
        const item = toPlain(row);
        return formatPayment({
          id: item.id,
          title: "เติมเงิน E-Wallet",
          reference_table: "wallet_topups",
          reference_id: item.id,
          amount: item.amount,
          payment_status: item.payment_status,
          created_at: item.created_at,
          type: "WALLET_TOPUP",
          slip_image_url: item.slip_image_url,
        });
      }),
      ...planPayments.map((row) => {
        const item = toPlain(row);
        return formatPayment({
          id: item.id,
          title: item.plan?.name || "Subscription",
          reference_table: "buy_plans",
          reference_id: item.plan_id,
          amount: item.amount,
          payment_status: item.payment_status,
          created_at: item.created_at,
          type: "SUBSCRIPTION",
          slip_image_url: item.slip_image_url,
        });
      }),
      ...sheetPayments.map((row) => {
        const item = toPlain(row);
        return formatPayment({
          id: item.id,
          title: item.sheet?.title || "Sheet purchase",
          reference_table: "buy_sheets",
          reference_id: item.sheet_id,
          amount: item.amount,
          payment_status: item.payment_status,
          created_at: item.created_at,
          type: "SHEET_PURCHASE",
          slip_image_url: item.slip_image_url,
        });
      }),
    ];

    return responseTemplates.setOKResponse({
      payments: sortByCreatedAtDesc(payments),
    });
  },
};
