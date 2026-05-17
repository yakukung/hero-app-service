import { RESPONSE_MESSAGES } from "../constants/response.constant.js";
import { responseTemplates } from "../utils/response.utils.js";
import { repository as subscriptionsRepository } from "../repositories/subscriptions.repositories.js";
import {
  addBillingInterval,
  message,
  parsePositiveAmount,
  toNumber,
  toPlain,
} from "../utils/backend.utils.js";

const mapPlan = (row) => {
  const plan = toPlain(row);
  return {
    id: plan.id,
    plan_id: plan.id,
    name: plan.name,
    title: plan.name,
    description: plan.description,
    price: toNumber(plan.price),
    billing_interval: plan.billing_interval,
    interval: plan.billing_interval,
    billing_interval_count: plan.billing_interval_count,
    created_at: plan.created_at,
  };
};

const mapBuyPlan = (row) => {
  const payment = toPlain(row);
  return {
    id: payment.id,
    plan_id: payment.plan_id,
    plan_name: payment.plan?.name,
    amount: toNumber(payment.amount),
    payment_method: payment.payment_method,
    payment_status: payment.payment_status,
    status: payment.payment_status,
    slip_image_url: payment.slip_image_url,
    created_at: payment.created_at,
  };
};

export const activateSubscriptionPayment = async (
  payment,
  actorId,
  transaction,
) => {
  const buyPlan = toPlain(payment);
  const plan = buyPlan.plan
    ? buyPlan.plan
    : toPlain(
        await subscriptionsRepository.findPlanById(buyPlan.plan_id, transaction),
      );

  if (!plan) return null;

  const now = new Date();
  const activeSubscription = await subscriptionsRepository.findActiveSubscription(
    buyPlan.user_id,
    buyPlan.plan_id,
    now,
    transaction,
  );

  const startAt = activeSubscription
    ? new Date(activeSubscription.expires_at)
    : now;
  const expiresAt = addBillingInterval(
    startAt,
    plan.billing_interval,
    plan.billing_interval_count,
  );

  if (activeSubscription) {
    await subscriptionsRepository.updateUserPlan(
      activeSubscription,
      {
        expires_at: expiresAt,
        updated_by: actorId,
      },
      transaction,
    );
    return activeSubscription;
  }

  return subscriptionsRepository.createUserPlan(
    {
      user_id: buyPlan.user_id,
      plan_id: buyPlan.plan_id,
      start_at: now,
      expires_at: expiresAt,
      auto_renew: false,
      status_flag: "ACTIVE",
      created_by: actorId,
    },
    transaction,
  );
};

export const service = {
  async getPlans() {
    const plans = await subscriptionsRepository.findActivePlans();

    return responseTemplates.setOKResponse({
      plans: plans.map(mapPlan),
    });
  },

  async createSubscription(req) {
    if (!req.file?.path) {
      return responseTemplates.setBadRequestResponse(
        message("กรุณาแนบสลิปการชำระเงิน", "Payment slip is required."),
      );
    }

    const amount = parsePositiveAmount(req.body.amount);
    if (!amount) {
      return responseTemplates.setBadRequestResponse(RESPONSE_MESSAGES.BAD_REQUEST);
    }

    const paymentMethod = req.body.payment_method || "PROMPTPAY";
    if (paymentMethod !== "PROMPTPAY") {
      return responseTemplates.setBadRequestResponse(
        message("รองรับการสมัครสมาชิกด้วย PromptPay เท่านั้น", "Only PromptPay subscriptions are supported."),
      );
    }

    const where = req.body.plan_id
      ? { id: req.body.plan_id }
      : { name: req.body.package_title };

    const plan = await subscriptionsRepository.findPlanByWhere(where);

    if (!plan) {
      return responseTemplates.setNotFoundResponse(RESPONSE_MESSAGES.DATA_NOT_FOUND);
    }

    const payment = await subscriptionsRepository.createBuyPlan({
      user_id: req.user.id,
      plan_id: plan.id,
      payment_method: paymentMethod,
      amount: toNumber(plan.price),
      payment_status: "PENDING",
      slip_image_url: `/${req.file.path}`,
      created_by: req.user.id,
    });

    payment.setDataValue("plan", plan);
    return responseTemplates.setCreatedResponse(mapBuyPlan(payment));
  },

  async getMe(req) {
    const now = new Date();
    const subscription =
      await subscriptionsRepository.findCurrentActiveSubscriptionWithPlan(
        req.user.id,
        now,
      );

    if (!subscription) {
      return responseTemplates.setOKResponse({
        is_premium: false,
        plan_id: null,
        plan_name: null,
        expires_at: null,
        auto_renew: false,
      });
    }

    const data = toPlain(subscription);
    return responseTemplates.setOKResponse({
      is_premium: true,
      plan_id: data.plan_id,
      plan_name: data.plan?.name || null,
      expires_at: data.expires_at,
      auto_renew: data.auto_renew,
    });
  },
};
