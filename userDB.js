const dbConnect = require("./config/db.js");
const userModel = require("./models/User"); // Adjust the path as per your project structure
const userData = require("./user.json"); // The JSON file you provided
const bcrypt = require("bcryptjs");

const start = async () => {
  try {
    await dbConnect();
    console.log("Database connected");

    // // Delete existing users
    // await userModel.deleteMany({});
    // console.log("Existing users deleted (if any)");

    const users = [];

    // Hash passwords and prepare data
    for (const user of userData.users) {
      try {
        // Check if the necessary fields exist
        if (!user.id || !user.email || !user.password) {
          console.warn(
            `Missing required field for user: ${JSON.stringify(user)}`
          );
          continue; // Skip user with missing fields
        }

        // Hash the user's password
        const hashedPassword = await bcrypt.hash(user.password, 10);

        // Prepare the user object with hashed password
        const newUser = {
          id: user.id,
          name: `User ${user.id}`, // Custom name
          email: user.email,
          password: hashedPassword,
        };

        // Add the user to the users array
        users.push(newUser);
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error);
        continue; // Skip if there's an issue with hashing or data preparation
      }
    }

    if (users.length === 0) {
      console.log("No valid users to insert");
      process.exit(0);
    }

    console.log("Users data to insert:", users);

    // Insert users into the database
    const result = await userModel.create(users);
    console.log("Data import success:", result);

    process.exit(0); // Graceful exit on success
  } catch (error) {
    console.error("Error with data import:", error);
    process.exit(1); // Graceful exit on error
  }
};

start();
