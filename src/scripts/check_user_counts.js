import { repository as usersRepository } from "../repositories/users.repositories.js";
import { models } from "../models/sequelize/associations.js";
import { v7 as uuidv7 } from "uuid";
import { STATUS_FLAG } from "../constants/status_flag.constants.js";

async function verifyCounts() {
  const followerId = uuidv7();
  const followingId = uuidv7();

  try {
    // Create two users
    await models.Users.create({
      id: followerId,
      username: "follower_test",
      email: "follower@test.com",
      role_id: "8c385750-f38b-11ef-9357-124b86866291", // Assuming a valid role ID requires lookup, but let's try to bypass or fetch one first
      // Actually, let's fetch a valid role first
    });

    // Wait, role_id is required. Let's fetch the first role.
    const role = await models.Roles.findOne();
    if (!role) {
      console.error("No roles found. Cannot create users.");
      process.exit(1);
    }

    await models.Users.create({
      id: followerId,
      username: "follower_test_" + Date.now(),
      email: "follower_" + Date.now() + "@test.com",
      role_id: role.id,
      status_flag: STATUS_FLAG.ACTIVE,
    });

    await models.Users.create({
      id: followingId,
      username: "following_test_" + Date.now(),
      email: "following_" + Date.now() + "@test.com",
      role_id: role.id,
      status_flag: STATUS_FLAG.ACTIVE,
    });

    // Create follow relationship
    await models.UsersFollows.create({
      follower_id: followerId,
      following_id: followingId,
      status_flag: STATUS_FLAG.ACTIVE,
    });

    // Check counts for follower
    const followerResult = await usersRepository.findById(followerId);
    const followerData = followerResult.data;
    console.log("Follower Data:", {
      username: followerData.username,
      followingCount: followerData.dataValues.followingCount,
      followersCount: followerData.dataValues.followersCount,
    });

    // Check counts for following
    const followingResult = await usersRepository.findById(followingId);
    const followingData = followingResult.data;
    console.log("Following Data:", {
      username: followingData.username,
      followingCount: followingData.dataValues.followingCount,
      followersCount: followingData.dataValues.followersCount,
    });

    if (
      followerData.dataValues.followingCount == 1 &&
      followerData.dataValues.followersCount == 0 &&
      followingData.dataValues.followingCount == 0 &&
      followingData.dataValues.followersCount == 1
    ) {
      console.log("SUCCESS: Counts are correct.");
    } else {
      console.error("FAILURE: Counts are incorrect.");
    }
  } catch (error) {
    console.error("Error verifying counts:", error);
  } finally {
    // Cleanup
    await models.UsersFollows.destroy({
      where: { follower_id: followerId, following_id: followingId },
    });
    await models.Users.destroy({ where: { id: [followerId, followingId] } });
    process.exit(0);
  }
}

verifyCounts();
