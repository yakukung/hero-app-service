import { SheetsFiles } from "../models/sequelize/sheets_files.model.js";
import { HTTP_STATUS } from "../constants/http_status.constants.js";
import { responseRepository } from "../utils/response.utils.js";

export const repository = {
  async create(
    sheetId,
    format,
    size,
    originalPath,
    checksum,
    index,
    transaction
  ) {
    try {
      const result = await SheetsFiles.create(
        {
          sheet_id: sheetId,
          format: format,
          size: size,
          original_path: originalPath,
          thumbnail_path: originalPath,
          checksum: checksum,
          index: index,
        },
        { transaction }
      );
      if (result === null) {
        return responseRepository.setResult(HTTP_STATUS.FAILED, null);
      }
      return responseRepository.setResult(HTTP_STATUS.CREATED, result);
    } catch (error) {
      console.log(error);
      return responseRepository.setResult(HTTP_STATUS.FAILED, null);
    }
  },
};
