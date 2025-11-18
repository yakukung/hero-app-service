import Joi from "joi";

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().max(255).required(),
  password: Joi.string().min(8).max(255).required(),
  confirm_password: Joi.string()
    .required()
    .valid(Joi.ref("password"))
    .messages({ "any.only": "confirm_password must match password" }),
});

export const validateRegisterPayload = (payload) =>
  registerSchema.validate(payload, {
    abortEarly: false,
    stripUnknown: true,
  });

