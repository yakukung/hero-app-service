import { service as sheetsService } from "../services/sheets.services.js";

export const controller = {
  async getAll(req, res) {
    try {
      const result = await sheetsService.getAll(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
    }
  },
  async getById(req, res) {
    try {
      const result = await sheetsService.getById(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
    }
  },
  async create(req, res) {
    try {
      ["keywords", "questions"].forEach((key) => {
        if (typeof req.body[key] === "string") {
          try {
            req.body[key] = JSON.parse(req.body[key]);
          } catch {
            if (key === "keywords") req.body[key] = [req.body[key]];
          }
        }
      });

      const result = await sheetsService.create(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
    }
  },
};
