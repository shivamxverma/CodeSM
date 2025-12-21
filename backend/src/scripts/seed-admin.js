import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

export async function seedAdmin() {

  const adminExists = await User.findOne({ role: "admin" });
  if (adminExists) {
    console.log("Admin already exists. Skipping.");
    process.exit(0);
  }

  const { ADMIN_USERNAME,ADMIN_FULLNAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error("ADMIN_EMAIL / ADMIN_PASSWORD missing");
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  await User.create({
    username: ADMIN_USERNAME,
    fullName : ADMIN_FULLNAME,
    email: ADMIN_EMAIL,
    password : passwordHash,
    role: "admin",
  });

  console.log("Admin created");
  process.exit(0);
}
