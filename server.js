import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import "./src/utils/dotenv.utils.js";
import "./src/configs/sequelize.configs.js";
import { router as authRouter } from "./src/routes/auth.routes.js";
import { router as sheetsRouter } from "./src/routes/sheets.routes.js";
import { router as usersRouter } from "./src/routes/users.routes.js";
import { router as categoriesRouter } from "./src/routes/categories.routes.js";
import { router as postsRouter } from "./src/routes/posts.routes.js";
import { router as paymentsRouter } from "./src/routes/payments.routes.js";
import { router as walletRouter } from "./src/routes/wallet.routes.js";
import { router as subscriptionsRouter } from "./src/routes/subscriptions.routes.js";
import { router as quizRouter } from "./src/routes/quiz.routes.js";
import { router as reportsRouter } from "./src/routes/reports.routes.js";
import { router as recommendationsRouter } from "./src/routes/recommendations.routes.js";
import { router as notificationsRouter } from "./src/routes/notifications.routes.js";
import { router as revenueRouter } from "./src/routes/revenue.routes.js";
import { router as adminRouter } from "./src/routes/admin.routes.js";
import { RESPONSE_MESSAGES } from "./src/constants/response.constant.js";
import { responseTemplates } from "./src/utils/response.utils.js";
const app = express();
const PORT = process.env.PORT;

app.get("/", (_req, res) => {
  res.json({ message: "Hero app API running" });
});

app.use(express.json());
app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/sheets", sheetsRouter);
app.use("/categories", categoriesRouter);
app.use("/posts", postsRouter);
app.use("/payments", paymentsRouter);
app.use("/wallet", walletRouter);
app.use("/subscriptions", subscriptionsRouter);
app.use("/quiz", quizRouter);
app.use("/reports", reportsRouter);
app.use("/recommendations", recommendationsRouter);
app.use("/notifications", notificationsRouter);
app.use("/revenue", revenueRouter);
app.use("/admin", adminRouter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((err, _req, res, _next) => {
  const isUploadError =
    err?.code?.startsWith?.("LIMIT_") ||
    err?.message === "Only images are allowed!" ||
    err?.message === "Only image or PDF files are allowed for sheet files.";
  if (!isUploadError) {
    console.error(err);
  }
  const response = isUploadError
    ? responseTemplates.setBadRequestResponse({
        message: {
          th: "ไฟล์อัปโหลดไม่ถูกต้อง",
          en: err.message || "Invalid upload.",
        },
      })
    : responseTemplates.setInternalServerErrorResponse(
        RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      );
  return res.status(parseInt(response.code)).json(response);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
