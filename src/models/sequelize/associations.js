import { Roles } from "./roles.model.js";
import { Permissions } from "./permissions.model.js";
import { Scopes } from "./scopes.model.js";
import { Users } from "./users.model.js";
import { UserProviders } from "./user_providers.model.js";
import { Sessions } from "./sessions.model.js";
import { Tokens } from "./tokens.model.js";
import { Categories } from "./categories.model.js";
import { Keywords } from "./keywords.model.js";
import { Sheets } from "./sheets.model.js";
import { SheetsCategories } from "./sheets_categories.model.js";
import { SheetsKeywords } from "./sheets_keywords.model.js";
import { SheetsFiles } from "./sheets_files.model.js";
import { SheetsQuestions } from "./sheets_questions.model.js";
import { SheetsAnswers } from "./sheets_answers.model.js";
import { UsersSheetsAnswers } from "./users_sheets_answers.model.js";
import { UsersSheetsFavorites } from "./users_sheets_favorites.model.js";
import { Posts } from "./posts.model.js";
import { PostsLikes } from "./posts_likes.model.js";
import { PostsComments } from "./posts_comments.model.js";
import { PostsShares } from "./posts_shares.model.js";
import { UsersReports } from "./users_reports.model.js";
import { UsersPayments } from "./users_payments.model.js";
import { Plans } from "./plans.model.js";
import { UsersPlans } from "./users_plans.model.js";

export const models = {
  Roles,
  Permissions,
  Scopes,
  Users,
  UserProviders,
  Sessions,
  Tokens,
  Categories,
  Keywords,
  Sheets,
  SheetsCategories,
  SheetsKeywords,
  SheetsFiles,
  SheetsQuestions,
  SheetsAnswers,
  UsersSheetsAnswers,
  UsersSheetsFavorites,
  Posts,
  PostsLikes,
  PostsComments,
  PostsShares,
  UsersReports,
  UsersPayments,
  Plans,
  UsersPlans,
};

let associationsApplied = false;

export const applyAssociations = () => {
  if (associationsApplied) {
    return models;
  }

  // Roles & Permissions via scopes
  Roles.hasMany(Users, { foreignKey: "role_id", as: "users" });
  Users.belongsTo(Roles, { foreignKey: "role_id", as: "role" });

  Roles.belongsToMany(Permissions, {
    through: Scopes,
    foreignKey: "role_id",
    otherKey: "permission_id",
    as: "permissions",
  });
  Permissions.belongsToMany(Roles, {
    through: Scopes,
    foreignKey: "permission_id",
    otherKey: "role_id",
    as: "roles",
  });
  Roles.hasMany(Scopes, { foreignKey: "role_id", as: "scopes" });
  Permissions.hasMany(Scopes, { foreignKey: "permission_id", as: "scopes" });
  Scopes.belongsTo(Roles, { foreignKey: "role_id", as: "role" });
  Scopes.belongsTo(Permissions, {
    foreignKey: "permission_id",
    as: "permission",
  });

  // User auth-related tables
  Users.hasMany(UserProviders, { foreignKey: "user_id", as: "providers" });
  UserProviders.belongsTo(Users, { foreignKey: "user_id", as: "user" });

  Users.hasMany(Sessions, { foreignKey: "user_id", as: "sessions" });
  Sessions.belongsTo(Users, { foreignKey: "user_id", as: "user" });

  Sessions.hasMany(Tokens, { foreignKey: "session_id", as: "tokens" });
  Tokens.belongsTo(Sessions, { foreignKey: "session_id", as: "session" });

  // Sheets & related metadata
  Users.hasMany(Sheets, { foreignKey: "author_id", as: "authoredSheets" });
  Sheets.belongsTo(Users, { foreignKey: "author_id", as: "author" });

  Sheets.belongsToMany(Categories, {
    through: SheetsCategories,
    foreignKey: "sheet_id",
    otherKey: "category_id",
    as: "categories",
  });
  Categories.belongsToMany(Sheets, {
    through: SheetsCategories,
    foreignKey: "category_id",
    otherKey: "sheet_id",
    as: "sheets",
  });
  Sheets.hasMany(SheetsCategories, { foreignKey: "sheet_id", as: "sheetCategories" });
  Categories.hasMany(SheetsCategories, {
    foreignKey: "category_id",
    as: "categoryLinks",
  });
  SheetsCategories.belongsTo(Sheets, { foreignKey: "sheet_id", as: "sheet" });
  SheetsCategories.belongsTo(Categories, {
    foreignKey: "category_id",
    as: "category",
  });

  Sheets.belongsToMany(Keywords, {
    through: SheetsKeywords,
    foreignKey: "sheet_id",
    otherKey: "keyword_id",
    as: "keywords",
  });
  Keywords.belongsToMany(Sheets, {
    through: SheetsKeywords,
    foreignKey: "keyword_id",
    otherKey: "sheet_id",
    as: "sheets",
  });
  Sheets.hasMany(SheetsKeywords, { foreignKey: "sheet_id", as: "sheetKeywords" });
  Keywords.hasMany(SheetsKeywords, {
    foreignKey: "keyword_id",
    as: "keywordLinks",
  });
  SheetsKeywords.belongsTo(Sheets, { foreignKey: "sheet_id", as: "sheet" });
  SheetsKeywords.belongsTo(Keywords, {
    foreignKey: "keyword_id",
    as: "keyword",
  });

  Sheets.hasMany(SheetsFiles, { foreignKey: "sheet_id", as: "files" });
  SheetsFiles.belongsTo(Sheets, { foreignKey: "sheet_id", as: "sheet" });

  Sheets.hasMany(SheetsQuestions, { foreignKey: "sheet_id", as: "questions" });
  SheetsQuestions.belongsTo(Sheets, { foreignKey: "sheet_id", as: "sheet" });

  SheetsQuestions.hasMany(SheetsAnswers, { foreignKey: "question_id", as: "answers" });
  SheetsAnswers.belongsTo(SheetsQuestions, {
    foreignKey: "question_id",
    as: "question",
  });

  SheetsQuestions.hasMany(UsersSheetsAnswers, {
    foreignKey: "question_id",
    as: "userAnswers",
  });
  SheetsAnswers.hasMany(UsersSheetsAnswers, {
    foreignKey: "selected_answer_id",
    as: "userAnswers",
  });
  Users.hasMany(UsersSheetsAnswers, { foreignKey: "user_id", as: "sheetAnswers" });
  UsersSheetsAnswers.belongsTo(Users, { foreignKey: "user_id", as: "user" });
  UsersSheetsAnswers.belongsTo(SheetsQuestions, {
    foreignKey: "question_id",
    as: "question",
  });
  UsersSheetsAnswers.belongsTo(SheetsAnswers, {
    foreignKey: "selected_answer_id",
    as: "selectedAnswer",
  });

  Users.belongsToMany(Sheets, {
    through: UsersSheetsFavorites,
    foreignKey: "user_id",
    otherKey: "sheet_id",
    as: "favoriteSheets",
  });
  Sheets.belongsToMany(Users, {
    through: UsersSheetsFavorites,
    foreignKey: "sheet_id",
    otherKey: "user_id",
    as: "favoritedBy",
  });
  Users.hasMany(UsersSheetsFavorites, {
    foreignKey: "user_id",
    as: "favoriteEntries",
  });
  Sheets.hasMany(UsersSheetsFavorites, {
    foreignKey: "sheet_id",
    as: "favoriteEntries",
  });
  UsersSheetsFavorites.belongsTo(Users, { foreignKey: "user_id", as: "user" });
  UsersSheetsFavorites.belongsTo(Sheets, { foreignKey: "sheet_id", as: "sheet" });

  // Posts & engagements
  Users.hasMany(Posts, { foreignKey: "user_id", as: "posts" });
  Sheets.hasMany(Posts, { foreignKey: "sheet_id", as: "posts" });
  Posts.belongsTo(Users, { foreignKey: "user_id", as: "author" });
  Posts.belongsTo(Sheets, { foreignKey: "sheet_id", as: "sheet" });

  Posts.hasMany(PostsLikes, { foreignKey: "post_id", as: "likes" });
  PostsLikes.belongsTo(Posts, { foreignKey: "post_id", as: "post" });
  Users.hasMany(PostsLikes, { foreignKey: "user_id", as: "postLikes" });
  PostsLikes.belongsTo(Users, { foreignKey: "user_id", as: "user" });
  Users.belongsToMany(Posts, {
    through: PostsLikes,
    foreignKey: "user_id",
    otherKey: "post_id",
    as: "likedPosts",
  });
  Posts.belongsToMany(Users, {
    through: PostsLikes,
    foreignKey: "post_id",
    otherKey: "user_id",
    as: "likedBy",
  });

  Posts.hasMany(PostsComments, { foreignKey: "post_id", as: "comments" });
  PostsComments.belongsTo(Posts, { foreignKey: "post_id", as: "post" });
  Users.hasMany(PostsComments, { foreignKey: "user_id", as: "postComments" });
  PostsComments.belongsTo(Users, { foreignKey: "user_id", as: "user" });

  Posts.hasMany(PostsShares, { foreignKey: "post_id", as: "shares" });
  PostsShares.belongsTo(Posts, { foreignKey: "post_id", as: "post" });
  Users.hasMany(PostsShares, { foreignKey: "user_id", as: "postShares" });
  PostsShares.belongsTo(Users, { foreignKey: "user_id", as: "user" });

  // User reports & payments
  Users.hasMany(UsersReports, { foreignKey: "reporter_id", as: "reports" });
  UsersReports.belongsTo(Users, { foreignKey: "reporter_id", as: "reporter" });

  Users.hasMany(UsersPayments, { foreignKey: "user_id", as: "payments" });
  UsersPayments.belongsTo(Users, { foreignKey: "user_id", as: "user" });

  // Plans & subscriptions
  Users.belongsToMany(Plans, {
    through: UsersPlans,
    foreignKey: "user_id",
    otherKey: "plan_id",
    as: "plans",
  });
  Plans.belongsToMany(Users, {
    through: UsersPlans,
    foreignKey: "plan_id",
    otherKey: "user_id",
    as: "subscribers",
  });
  Users.hasMany(UsersPlans, { foreignKey: "user_id", as: "userPlans" });
  Plans.hasMany(UsersPlans, { foreignKey: "plan_id", as: "subscriptions" });
  UsersPlans.belongsTo(Users, { foreignKey: "user_id", as: "user" });
  UsersPlans.belongsTo(Plans, { foreignKey: "plan_id", as: "plan" });

  associationsApplied = true;
  return models;
};

