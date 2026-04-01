import { service as usersService } from "../services/users.services.js";

export const controller = {
  async getAll(req, res) {
    try {
      const result = await usersService.getAll(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
  async getById(req, res) {
    try {
      const result = await usersService.getById(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  async updateProfile(req, res) {
    try {
      const result = await usersService.updateProfile(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
  async updateProfileImage(req, res) {
    try {
      const result = await usersService.updateProfileImage(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
  async updatePassword(req, res) {
    try {
      const result = await usersService.updatePassword(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
  async updateUsername(req, res) {
    try {
      const result = await usersService.updateUsername(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
  async updateEmail(req, res) {
    try {
      const result = await usersService.updateEmail(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
  async updateStatusFlag(req, res) {
    try {
      const result = await usersService.updateStatusFlag(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
  async updateKeyword(req, res) {
    try {
      const result = await usersService.updateKeyword(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
  async follow(req, res) {
    try {
      const result = await usersService.follow(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
  async unfollow(req, res) {
    try {
      const result = await usersService.unfollow(req, res);
      res.status(parseInt(result.code)).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
};
