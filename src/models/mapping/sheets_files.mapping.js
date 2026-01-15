export const mapping = {
  async mapSheetsFiles(data, count) {
    try {
      let result = [];
      for (let index = 0; index < data.length; index++) {
        const element = data[index].dataValues;
        const mapData = await this.mapSheetFile(element);
        result.push(mapData);
      }
      return {
        total_items: parseInt(count),
        sheets_files: result,
      };
    } catch (error) {
      console.log(error);
    }
  },
  async mapSheetsFilesDetail(data) {
    try {
      let result = [];
      for (let index = 0; index < data.length; index++) {
        const element = data[index].dataValues;
        const mapData = await this.mapSheetFile(element);
        result.push(mapData);
      }
      return result;
    } catch (error) {
      console.log(error);
    }
  },
  async mapSheetFile(data) {
    try {
      return {
        id: data.id,
        sheet_id: data.sheet_id,
        format: data.format,
        size: data.size,
        original_path: data.original_path,
        thumbnail_path: data.thumbnail_path,
        index: data.index,
        checksum: data.checksum,
        flag: {
          visible_flag: data.visible_flag,
          status_flag: data.status_flag,
          status_modified_at: data.status_modified_at,
        },
        operation: {
          created_at: data.created_at,
          created_by: data.created_by,
          updated_at: data.updated_at,
          updated_by: data.updated_by,
        },
      };
    } catch (error) {
      console.log(error);
    }
  },
};
