export const mapping = {
  async mapPostsComments(data, count) {
    try {
      let result = [];
      for (let index = 0; index < data.length; index++) {
        const element = data[index].dataValues;
        const mapData = await this.mapPostComment(element);
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
  async mapPostComment(data) {
    return {
      user_id: data.user_id,
      user: data.user
        ? {
            id: data.user.id,
            username: data.user.username,
            profile_image: data.user.profile_image,
          }
        : null,
      content: data.content,
      created_at: data.created_at,
    };
  },
};
