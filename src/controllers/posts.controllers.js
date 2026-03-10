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
  async getById(req, res) {
    try {
      const result = await postsService.getById(req, res);
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
  async like(req, res) {
    try {
      const result = await postsService.like(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
    }
  },
  async unlike(req, res) {
    try {
      const result = await postsService.unlike(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
    }
  },
  async comment(req, res) {
    try {
      const result = await postsService.comment(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
    }
  },
  async deleteComment(req, res) {
    try {
      const result = await postsService.deleteComment(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
    }
  },
  async share(req, res) {
    try {
      const result = await postsService.share(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
    }
  },
};
