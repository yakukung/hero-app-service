import { Op } from "sequelize";
import { models } from "../models/sequelize/associations.js";

export const repository = {
  async findPlanById(planId, transaction) {
    return models.Plans.findOne({
      where: { id: planId },
      transaction,
    });
  },

  async findActiveSubscription(userId, planId, now, transaction) {
    return models.UsersPlans.findOne({
      where: {
        user_id: userId,
        plan_id: planId,
        visible_flag: {
          [Op.ne]: false,
        },
        status_flag: "ACTIVE",
        expires_at: {
          [Op.gt]: now,
        },
      },
      order: [["expires_at", "DESC"]],
      transaction,
      lock: transaction?.LOCK?.UPDATE,
    });
  },

  async updateUserPlan(userPlan, payload, transaction) {
    return userPlan.update(payload, { transaction });
  },

  async createUserPlan(payload, transaction) {
    return models.UsersPlans.create(payload, { transaction });
  },

  async findActivePlans() {
    return models.Plans.findAll({
      where: {
        visible_flag: {
          [Op.ne]: false,
        },
        status_flag: "ACTIVE",
      },
      order: [["price", "ASC"]],
    });
  },

  async findPlanByWhere(where) {
    return models.Plans.findOne({
      where: {
        ...where,
        visible_flag: {
          [Op.ne]: false,
        },
        status_flag: "ACTIVE",
      },
    });
  },

  async createBuyPlan(payload) {
    return models.BuyPlans.create(payload);
  },

  async findCurrentActiveSubscriptionWithPlan(userId, now) {
    return models.UsersPlans.findOne({
      where: {
        user_id: userId,
        visible_flag: {
          [Op.ne]: false,
        },
        status_flag: "ACTIVE",
        expires_at: {
          [Op.gt]: now,
        },
      },
      include: [{ model: models.Plans, as: "plan" }],
      order: [["expires_at", "DESC"]],
    });
  },
};
