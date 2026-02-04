import { service as authService } from "../services/auth.services.js";

import {
  getVerificationSuccessTemplate,
  getVerificationErrorTemplate,
} from "../utils/templates.utils.js";

export const controller = {
  async register(req, res) {
    try {
      const result = await authService.register(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
    }
  },
  async verify(req, res) {
    try {
      const result = await authService.verify(req, res);
      if (req.method === "GET") {
        if (result.code === 204) {
          return res.send(
            getVerificationSuccessTemplate(process.env.FRONTEND_URL),
          );
        } else {
          return res.send(getVerificationErrorTemplate(result.message));
        }
      }

      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      if (req.method === "GET") {
        return res.send(getVerificationErrorTemplate());
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
  async login(req, res) {
    try {
      const result = await authService.login(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
    }
  },
  async loginByGoogle(req, res) {
    try {
      const result = await authService.loginByGoogle(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
    }
  },
};
