import { mapping as mapUserResponse } from "../mapping/users.mapping.js";
import { mapping as mapSheetResponse } from "../mapping/sheets.mapping.js";
import { mapping as mapPostsLikes } from "../mapping/posts_likes.mapping.js";
import { mapping as mapPostsComments } from "../mapping/posts_comments.mapping.js";
import { mapping as mapPostsShares } from "../mapping/posts_shares.mapping.js";

export const mapping = {
  async mapPosts(data, count) {
    try {
      let result = [];
      for (let index = 0; index < data.length; index++) {
        const element = data[index].dataValues;
        const mapData = await this.mapPost(element);
        result.push(mapData);
      }
      return {
        total_items: parseInt(count),
        posts: result,
      };
    } catch (error) {
      console.log(error);
    }
  },
  async mapPost(data) {
    const user = data.author
      ? await mapUserResponse.mapUser(data.author)
      : null;
    const sheet = data.sheet
      ? await mapSheetResponse.mapSheet(data.sheet)
      : null;
    const likes =
      data.likes && data.likes.length > 0
        ? await mapPostsLikes.mapPostsLikes(data.likes, data.likes.length)
        : null;
    const comments =
      data.comments && data.comments.length > 0
        ? await mapPostsComments.mapPostsComments(
            data.comments,
            data.comments.length,
          )
        : null;
    const shares =
      data.shares && data.shares.length > 0
        ? await mapPostsShares.mapPostsShares(data.shares, data.shares.length)
        : null;
    return {
      id: data.id,
      content: data.content,
      sheet_id: data.sheet_id,
      user_id: data.user_id,
      like_count: data.like_count,
      comment_count: data.comment_count,
      share_count: data.share_count,
      author: user,
      sheet: sheet,
      likes: likes,
      comments: comments,
      shares: shares,
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
  },
};
