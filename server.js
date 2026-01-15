import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import "./src/utils/dotenv.utils.js";
import "./src/configs/sequelize.configs.js";
import { router as authRouter } from "./src/routes/auth.routes.js";
import { router as sheetsRouter } from "./src/routes/sheets.routes.js";
import { router as usersRouter } from "./src/routes/users.routes.js";
import { router as categoriesRouter } from "./src/routes/categories.routes.js";
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
