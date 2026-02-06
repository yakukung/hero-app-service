import fs from "fs/promises";
import crypto from "crypto";
import path from "path";
import sharp from "sharp";

export const resizeImage = async (sourcePath, destDir, width = 500) => {
  try {
    await fs.mkdir(destDir, { recursive: true });
    const fileName = path.basename(sourcePath);
    const destPath = path.join(destDir, fileName);

    await sharp(sourcePath)
      .rotate()
      .resize({ width: width, withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(destPath);

    return destPath;
  } catch (error) {
    console.error("Failed to resize image:", sourcePath, error);
    throw error;
  }
};

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

export const copyFile = async (sourcePath, destDir) => {
  try {
    await fs.mkdir(destDir, { recursive: true });
    const fileName = path.basename(sourcePath);
    const destPath = path.join(destDir, fileName);
    await fs.copyFile(sourcePath, destPath);
    return destPath;
  } catch (error) {
    console.error("Failed to copy file:", sourcePath, error);
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
