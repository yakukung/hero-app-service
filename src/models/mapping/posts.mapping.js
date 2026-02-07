import { mapping as mapUserResponse } from "../mapping/users.mapping.js";
import { mapping as mapSheetResponse } from "../mapping/sheets.mapping.js";

export const mapping = {
  async mapPost(data) {
    const user = data.author
      ? await mapUserResponse.mapUser(data.author)
      : null;
    const sheet = data.sheet
      ? await mapSheetResponse.mapSheet(data.sheet)
      : null;
    return {
      id: data.id,
      content: data.content,
      sheet_id: data.sheet_id,
      user_id: data.user_id,
      like_count: data.like_count,
      comment_count: data.comment_count,
      share_count: data.share_count,
      users: user,
      sheets: sheet,
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
