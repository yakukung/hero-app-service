import { service as categoriesService } from "../services/categories.services.js";

export const controller = {
  async getAll(req, res) {
    try {
      const result = await categoriesService.getAll(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
    }
  },
  async getById(req, res) {
    try {
      const result = await categoriesService.getById(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
    }
  },
};
