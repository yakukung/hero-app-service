import { mapping as mapUserResponse } from "./users.mapping.js";

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
    const rawUser =
      data.user && data.user.dataValues ? data.user.dataValues : data.user;
    const user = rawUser ? await mapUserResponse.mapUser(rawUser) : null;
    return {
      id: data.id,
      post_id: data.post_id,
      user_id: data.user_id,
      user: user,
      content: data.content,
      created_at: data.created_at,
    };
  },
};
