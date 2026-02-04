import { models as sequelize } from "./src/models/sequelize/associations.js";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import util from "util";
import "./src/utils/dotenv.utils.js"; // Load env

const execPromise = util.promisify(exec);

async function testUpload() {
  try {
    // 1. Find a user
    const user = await sequelize.Users.findOne();
    if (!user) {
      console.log("No user found in DB. Cannot test.");
      process.exit(1);
    }
    console.log("Testing with user:", user.id);

    // 2. Prepare file
    const filePath = path.join(process.cwd(), "test_image.jpg");
    // Create a dummy file if not exists
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "dummy image content");
    }

    // 3. Construct CURL command
    // curl -X PUT http://localhost:PORT/users/update-profile -F "uid=UID" -F "profile_image=@path"
    const port = process.env.PORT || 3000;
    const command = `curl -s -X PUT http://localhost:${port}/users/update-profile -F "uid=${user.id}" -F "profile_image=@${filePath}"`;

    console.log("Running command:", command);
    const { stdout, stderr } = await execPromise(command);

    console.log("Response:", stdout);
    if (stderr) console.error("Stderr:", stderr);
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    process.exit(0);
  }
}

testUpload();
