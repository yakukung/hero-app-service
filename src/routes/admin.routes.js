import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import { controller as adminController } from "../controllers/admin.controllers.js";

export const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get("/payments", adminController.getPayments);
router.patch("/wallet-top-ups/:id/status", adminController.updateWalletTopUpStatus);
router.patch("/subscriptions/:id/status", adminController.updateSubscriptionStatus);
router.patch("/sheet-purchases/:id/status", adminController.updateSheetPurchaseStatus);
router.get("/sheets", adminController.getSheets);
router.get("/sheets/:id", adminController.getSheetById);
router.get("/subscriptions", adminController.getSubscriptions);
router.get("/reports", adminController.getReports);
router.patch("/reports/:id/status", adminController.updateReportStatus);
router.post("/reports/:id/action", adminController.reportAction);
router.patch("/sheets/:id/status", adminController.updateSheetStatus);
router.patch("/posts/:id/status", adminController.updatePostStatus);
router.patch("/comments/:id/status", adminController.updateCommentStatus);
router.patch("/sheets/:id/reviews/:reviewId/status", adminController.updateReviewStatus);
router.get("/sheets/:id/reviews", adminController.getSheetReviews);
router.get("/posts/:id/comments", adminController.getPostComments);
router.get("/revenue", adminController.getRevenue);

router.patch("/users/:id/username", adminController.updateUserUsername);
router.patch("/users/:id/email", adminController.updateUserEmail);
router.patch("/users/:id/password", adminController.updateUserPassword);
router.put(
  "/users/:id/profile-image",
  upload.single("profile_image"),
  adminController.updateUserProfileImage,
);
router.get("/subjects", adminController.getSubjects);
router.post("/subjects", adminController.createSubject);
router.delete("/subjects/:id", adminController.deleteSubject);
router.patch("/plans/:id", adminController.updatePlan);
