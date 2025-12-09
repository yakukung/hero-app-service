const refreshTokenExpireMs = () => {
  const refreshTokenExpire = parseTimeToMs(process.env.JWT_EXPIRE_REFRESH_TOKEN);
  const result = Date.now() + refreshTokenExpire;
  return result;
};

const accessTokenExpireMs = () => {
  const accessTokenExpire = parseTimeToMs(process.env.JWT_EXPIRE_ACCESS_TOKEN);
  const result = Date.now() + accessTokenExpire;
  return result;
};

const parseTimeToMs = (timeString) => {
  const timeValue = parseInt(timeString);
  const timeUnit = timeString.slice(-1).toLowerCase();

  switch (timeUnit) {
    case "s":
      return timeValue * 1000;
    case "m":
      return timeValue * 60 * 1000;
    case "h":
      return timeValue * 60 * 60 * 1000;
    case "d":
      return timeValue * 24 * 60 * 60 * 1000;
    default:
      return timeValue * 60 * 1000; 
  }
};

export { parseTimeToMs, accessTokenExpireMs, refreshTokenExpireMs };