import bcrypt from "bcryptjs";
import { user } from "../db/schema.ts";
import env from '../config/index.ts'

export async function seedAdmin() {

  const adminExists = await user.findOne({ role: "ADMIN" });
  if (adminExists) {
    console.log("Admin already exists. Skipping.");
    process.exit(0);
  }

  const { ADMIN_USERNAME, ADMIN_FULLNAME, ADMIN_EMAIL, ADMIN_PASSWORD } = env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error("ADMIN_EMAIL / ADMIN_PASSWORD missing");
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  await user.create({
    username: ADMIN_USERNAME,
    fullName: ADMIN_FULLNAME,
    email: ADMIN_EMAIL,
    password: passwordHash,
    role: "admin",
  });

  console.log("Admin created");
  process.exit(0);
}
