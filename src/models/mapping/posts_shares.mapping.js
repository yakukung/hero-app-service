export const mapping = {
  async mapPostsShares(data, count) {
    try {
      let result = [];
      for (let index = 0; index < data.length; index++) {
        const element = data[index].dataValues;
        const mapData = await this.mapPostShare(element);
        result.push(mapData);
      }
      return {
        total_items: parseInt(count),
        data: result,
      };
    } catch (error) {
      console.log(error);
    }
  },
  async mapPostShare(data) {
    return {
      user_id: data.user_id,
      created_at: data.created_at,
    };
  },
};
