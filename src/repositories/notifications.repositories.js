import { models } from "../models/sequelize/associations.js";

export const repository = {
  async findReportsByWhere(where) {
    const [postReports, sheetReports, userReports] = await Promise.all([
      models.ReportPosts.findAll({ where }),
      models.ReportSheets.findAll({ where }),
      models.ReportUsers.findAll({ where }),
    ]);

    return {
      postReports,
      sheetReports,
      userReports,
    };
  },
};
