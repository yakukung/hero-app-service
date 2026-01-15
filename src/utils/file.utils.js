import fs from "fs/promises";
import crypto from "crypto";
import path from "path";

export const moveFile = async (oldPath, newDir) => {
  try {
    await fs.mkdir(newDir, { recursive: true });
    const fileName = path.basename(oldPath);
    const newPath = path.join(newDir, fileName);
    await fs.rename(oldPath, newPath);
    return newPath;
  } catch (error) {
    console.error("Failed to move file:", oldPath, error);
    throw error;
  }
};

export const deleteUploadedFiles = async (files) => {
  if (files) {
    for (const file of files) {
      try {
        await fs.unlink(file.path);
      } catch (error) {
        console.error("Failed to delete file:", file.path, error);
      }
    }
  }
};

export const calculateChecksum = async (filePath) => {
  try {
    const fileBuffer = await fs.readFile(filePath);
    return crypto.createHash("md5").update(fileBuffer).digest("hex");
  } catch (error) {
    console.error("Failed to calculate checksum:", filePath, error);
    return "checksum_error";
  }
};
