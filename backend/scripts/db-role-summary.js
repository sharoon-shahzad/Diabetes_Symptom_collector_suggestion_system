import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { UsersRoles } from '../models/User_Role.js';

async function main() {
  await connectDB();

  const totalUsers = await User.countDocuments({});
  const activeUsers = await User.countDocuments({ deleted_at: null });

  const totalMappings = await UsersRoles.countDocuments({});
  const activeMappings = await UsersRoles.countDocuments({ deleted_at: null });

  console.log({ totalUsers, activeUsers, totalMappings, activeMappings });

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('db-role-summary failed:', err);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});
