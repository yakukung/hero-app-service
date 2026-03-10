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
      id: data.id,
      post_id: data.post_id,
      user_id: data.user_id,
      content: data.content,
      created_at: data.created_at,
    };
  },
};
