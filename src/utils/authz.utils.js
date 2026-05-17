import { models } from "../models/sequelize/associations.js";

export const isAdminRole = async (roleId, transaction = undefined) => {
  if (!roleId) return false;

  const role = await models.Roles.findOne({
    attributes: ["id"],
    where: {
      id: roleId,
      name: "ADMIN",
      visible_flag: true,
      status_flag: "ACTIVE",
    },
    transaction,
  });

  return Boolean(role);
};
