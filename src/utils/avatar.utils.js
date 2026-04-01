import sharp from "sharp";
import path from "path";
import fs from "fs";

/**
 * Generate a PNG avatar with initials from a username and save it to disk.
 * Takes the first 2 characters of the username (uppercased) and renders them
 * as white text on a colored circular background.
 *
 * @param {string} username
 * @param {string} userId - The user's ID, used to determine the save directory
 * @returns {Promise<string>} The file path where the avatar was saved (e.g. uploads/users/<userId>/profiles/avatar.png)
 */
export async function generateInitialsAvatar(username, userId) {
  const initials = (username || "??").substring(0, 2).toUpperCase();

  const colors = [
    "#6C5CE7",
    "#00B894",
    "#E17055",
    "#0984E3",
    "#FDCB6E",
    "#E84393",
    "#00CEC9",
    "#D63031",
    "#A29BFE",
    "#55EFC4",
    "#FAB1A0",
    "#74B9FF",
    "#FF7675",
    "#FD79A8",
    "#636E72",
    "#2D3436",
  ];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = colors[Math.abs(hash) % colors.length];

  const size = 128;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size / 2}" fill="${color}"/>
  <text x="${size / 2}" y="${size / 2}" dy=".35em" text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif" font-weight="600"
        font-size="48" fill="#FFFFFF">${initials}</text>
</svg>`;

  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

  const dest = path.join("uploads", "users", userId, "profiles");
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const filename = `avatar-${Date.now()}.png`;
  const filePath = path.join(dest, filename);
  fs.writeFileSync(filePath, pngBuffer);

  return filePath;
}
