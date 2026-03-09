export const mapping = {
  async mapUsersFollows(data) {
    if (!data || data.length === 0) {
      return {
        count: 0,
        uid: null,
      };
    }
    return {
      count: data.length,
      uid: data.map((user) => user.id),
    };
  },
};
