import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let dest = "uploads/";
    if (req.baseUrl.includes("/admin") && req.params?.id) {
      dest = path.join(uploadDir, "users", req.params.id, "profiles");
    } else if (req.baseUrl.includes("/users")) {
      if (req.user && req.user.id) {
        dest = path.join(uploadDir, "users", req.user.id, "profiles");
      } else if (req.body && req.body.uid) {
        dest = path.join(uploadDir, "users", req.body.uid, "profiles");
      }
    } else if (req.baseUrl.includes("/sheets")) {
      if (req.params.id) {
        dest = path.join(uploadDir, "sheets", req.params.id);
      } else {
        if (file.fieldname === "files") {
          dest = path.join(uploadDir, "sheets", "temp", "original");
        } else {
          dest = path.join(uploadDir, "sheets", "temp");
        }
      }
    } else if (
      file.fieldname === "slip_image" &&
      (req.baseUrl.includes("/wallet") ||
        req.baseUrl.includes("/subscriptions") ||
        req.baseUrl.includes("/payments") ||
        req.baseUrl.includes("/admin"))
    ) {
      const userId = req.user?.id || "unknown";
      dest = path.join(uploadDir, "payments", userId, "slips");
    }

    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const generatedName = uniqueSuffix + path.extname(file.originalname);
    console.log("Generated filename:", generatedName);
    cb(null, generatedName);
  },
});

const fileFilter = (req, file, cb) => {
  const isImage = file.mimetype.startsWith("image/");
  const isPdf = file.mimetype === "application/pdf";
  const isSheetFile = req.baseUrl.includes("/sheets") && file.fieldname === "files";

  if (isSheetFile && (isImage || isPdf)) {
    return cb(null, true);
  }

  if (!isSheetFile && isImage) {
    return cb(null, true);
  }

  const errorMessage = isSheetFile
    ? "Only image or PDF files are allowed for sheet files."
    : "Only images are allowed!";
  return cb(new Error(errorMessage), false);
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});
