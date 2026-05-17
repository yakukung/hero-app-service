import { HTTP_STATUS } from "../constants/http_status.constants.js";
import { repository as recommendationsRepository } from "../repositories/recommendations.repositories.js";
import { responseTemplates } from "../utils/response.utils.js";
import { toNumber, toPlain } from "../utils/backend.utils.js";
import { verifyAccessToken } from "../utils/jwt.utils.js";

const optionalUserId = (req) => {
  const bearer = req.header("Authorization");
  if (!bearer) return null;

  const [, token] = bearer.split(" ");
  if (!token) return null;

  const accessToken = verifyAccessToken(token);
  return accessToken.code === HTTP_STATUS.OK.code ? accessToken.data.sub : null;
};

const mapRecommendedSheet = (sheet, userKeywords = []) => {
  const keywords = sheet.keywords?.map((keyword) => keyword.name) || [];
  const purchases =
    sheet.payments?.filter((payment) => payment.payment_status === "SUCCESSFUL")
      .length || 0;
  const favorites = sheet.favoriteEntries?.length || 0;
  const reviews = sheet.reviews || [];
  const avgReview =
    reviews.length === 0
      ? 0
      : reviews.reduce((sum, review) => sum + toNumber(review.score), 0) /
        reviews.length;
  const keywordBoost = keywords.filter((keyword) =>
    userKeywords.includes(keyword),
  ).length;
  const score = purchases * 3 + favorites * 2 + avgReview * 2 + keywordBoost * 5;

  return {
    id: sheet.id,
    title: sheet.title,
    description: sheet.description,
    rating: sheet.rating,
    price: toNumber(sheet.price),
    author_id: sheet.author_id,
    author_name: sheet.author?.username,
    keywords,
    score,
    created_at: sheet.created_at,
  };
};

export const service = {
  async list(req) {
    const userId = optionalUserId(req);
    const user = userId
      ? toPlain(
          await recommendationsRepository.findUserByIdWithKeywords(userId),
        )
      : null;
    const userKeywords = Array.isArray(user?.keyword) ? user.keyword : [];
    const limit = Math.min(Number(req.query.limit) || 20, 50);

    const rows = await recommendationsRepository.findRecommendedSheets(limit);

    const sheets = rows
      .map((row) => mapRecommendedSheet(toPlain(row), userKeywords))
      .sort((a, b) => b.score - a.score || new Date(b.created_at) - new Date(a.created_at));

    return responseTemplates.setOKResponse({
      sheets,
      recommendations: sheets,
    });
  },
};
