import { service as usersService } from "../services/users.services.js";

export const controller = {
  async getById(req, res) {
    try {
      const result = await usersService.getById(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
    }
  },

  async updateProfile(req, res) {
    try {
      const result = await usersService.updateProfile(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
    }
  },
};
