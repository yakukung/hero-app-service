import { mapping as mapRoleResponse } from "./roles.mapping.js";
// import { mapping as mapWalletResponse } from "./wallets.mapping.js";
import { mapping as mapUsersFollowsResponse } from "./users_follows.mapping.js";
export const mapping = {
  async mapUsers(data, count) {
    try {
      let result = [];
      for (let index = 0; index < data.length; index++) {
        const element = data[index].dataValues;
        const mapData = await this.mapUser(element);
        result.push(mapData);
      }
      return {
        total_items: parseInt(count),
        users: result,
      };
    } catch (error) {
      console.log(error);
    }
  },
  async mapUser(data) {
    try {
      return {
        id: data.id,
        username: data.username,
        email: data.email,
        profile_image: data.profile_image,
        auth_provider: data.auth_provider,
        role_id: data.role_id,
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
  async mapUserDetail(data) {
    const role = data.result.roles
      ? await mapRoleResponse.mapRole(data.result.roles)
      : null;
    const followers = await mapUsersFollowsResponse.mapUsersFollows(
      data.result.followers,
    );
    const followings = await mapUsersFollowsResponse.mapUsersFollows(
      data.result.followings,
    );
    try {
      return {
        id: data.result.id,
        username: data.result.username,
        email: data.result.email,
        profile_image: data.result.profile_image,
        auth_provider: data.result.auth_provider,
        roles: role,
        point: data.result.point,
        tokens: data.accessToken
          ? {
              access_token: data.accessToken,
              refresh_token: data.refreshToken,
              access_token_expires_at: data.accessTokenExpiresAt,
              refresh_token_expires_at: data.refreshTokenExpiresAt,
            }
          : undefined,
        followers: followers,
        followings: followings,
        flag: {
          visible_flag: data.result.visible_flag,
          status_flag: data.result.status_flag,
          status_modified_at: data.result.status_modified_at,
        },
        operation: {
          created_at: data.result.created_at,
          created_by: data.result.created_by,
          updated_at: data.result.updated_at,
          updated_by: data.result.updated_by,
        },
      };
    } catch (error) {
      console.log(error);
    }
  },
};
