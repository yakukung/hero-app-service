import { service as postsService } from "../services/posts.services.js";

export const controller = {
  async getAll(req, res) {
    try {
      const result = await postsService.getAll(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
    }
  },
  async create(req, res) {
    try {
      const result = await postsService.create(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
    }
  },
};
