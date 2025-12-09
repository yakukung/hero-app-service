export const mapping = {
  async mapRoles(data, count) {
    try {
      let result = [];
      for (let index = 0; index < data.length; index++) {
        const element = data[index].dataValues;
        const mapData = await this.mapRole(element);
        result.push(mapData);
      }
      return {
        total_items: parseInt(count),
        roles: result,
      };
    } catch (error) {
      console.log(error);
    }
  },
  async mapRole(data) {
    try {
      return {
        id: data.id,
        name: data.name,
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
