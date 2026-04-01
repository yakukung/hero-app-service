import { service as categoriesService } from "../services/categories.services.js";

export const controller = {
  async getAll(req, res) {
    try {
      const result = await categoriesService.getAll(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
  async getById(req, res) {
    try {
      const result = await categoriesService.getById(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
};
