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
  async updateProfileImage(req, res) {
    try {
      const result = await usersService.updateProfileImage(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
    }
  },
  async updatePassword(req, res) {
    try {
      const result = await usersService.updatePassword(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
    }
  },
  async updateUsername(req, res) {
    try {
      const result = await usersService.updateUsername(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
    }
  },
  async updateEmail(req, res) {
    try {
      const result = await usersService.updateEmail(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
    }
  },
};
