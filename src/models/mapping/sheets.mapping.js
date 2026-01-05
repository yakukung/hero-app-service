import {mapping as mapKeywordsResponse} from './keywords.mapping.js'
export const mapping = {
  async mapSheets(data, count) {
    try {
      let result = [];
      for (let index = 0; index < data.length; index++) {
        const element = data[index].dataValues;
        const mapData = await this.mapSheet(element);
        result.push(mapData);
      }
      return {
        total_items: parseInt(count),
        sheets: result,
      };
    } catch (error) {
      console.log(error);
    }
  },
  async mapSheetsDetail(data, count) {
    try {
      let result = [];
      for (let index = 0; index < data.length; index++) {
        const element = data[index].dataValues;
        const mapData = await this.mapSheetDetail(element);
        result.push(mapData);
      }
      return {
        total_items: parseInt(count),
        sheets: result,
      };
    } catch (error) {
      console.log(error);
    }
  },
  async mapSheet(data) {
    try {
      return {
        id: data.id,
        author_id: data.author_id,
        title: data.title,
        description: data.description,
        rating: data.rating,
        price: data.price,
        course: data.course,
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
  async mapSheetDetail(data) {
    try {
      const keywords = data.keywords ? await mapKeywordsResponse.mapKeywordsDataOnly(data.keywords) : null; 
      return {
        id: data.id,
        author_id: data.author_id,
        title: data.title,
        description: data.description,
        rating: data.rating,
        price: data.price,
        course: data.course,
        keywords: keywords,
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
