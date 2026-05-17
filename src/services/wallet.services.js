import { RESPONSE_MESSAGES } from "../constants/response.constant.js";
import { responseTemplates } from "../utils/response.utils.js";
import { message, parsePositiveAmount, toNumber, toPlain } from "../utils/backend.utils.js";
import { repository as walletRepository } from "../repositories/wallet.repositories.js";

const mapTopUp = (row) => {
  const topUp = toPlain(row);
  return {
    id: topUp.id,
    amount: toNumber(topUp.amount),
    payment_method: topUp.payment_method,
    payment_status: topUp.payment_status,
    status: topUp.payment_status,
    reference: topUp.id,
    slip_image_url: topUp.slip_image_url,
    created_at: topUp.created_at,
    updated_at: topUp.updated_at,
  };
};

const getSlipFile = (req) => {
  if (req.file) return req.file;
  return req.files?.slip_image?.[0] || req.files?.slipImage?.[0] || null;
};

export const service = {
  async getTopUps(req) {
    const rows = await walletRepository.findTopUpsByUser(req.user.id);

    return responseTemplates.setOKResponse({
      top_ups: rows.map(mapTopUp),
    });
  },

  async createTopUp(req) {
    const amount = parsePositiveAmount(req.body.amount);
    if (!amount) {
      return responseTemplates.setBadRequestResponse(RESPONSE_MESSAGES.BAD_REQUEST);
    }

    const slipFile = getSlipFile(req);
    if (!slipFile?.path) {
      return responseTemplates.setBadRequestResponse(
        message("กรุณาแนบสลิปการชำระเงิน", "Payment slip is required."),
      );
    }

    const paymentMethod =
      req.body.payment_method || req.body.paymentMethod || "PROMPTPAY";
    if (paymentMethod !== "PROMPTPAY") {
      return responseTemplates.setBadRequestResponse(
        message("รองรับการเติมเงินด้วย PromptPay เท่านั้น", "Only PromptPay top-ups are supported."),
      );
    }

    const topUp = await walletRepository.createTopUp({
      user_id: req.user.id,
      payment_method: paymentMethod,
      amount,
      payment_status: "PENDING",
      slip_image_url: `/${slipFile.path}`,
      created_by: req.user.id,
    });

    return responseTemplates.setCreatedResponse(mapTopUp(topUp));
  },
};
