import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { UserPersonalInfo } from '../models/UserPersonalInfo.js';
import { UserMedicalInfo } from '../models/UserMedicalInfo.js';

function parseArgs(argv) {
  const args = {};
  for (const raw of argv.slice(2)) {
    if (!raw.startsWith('--')) continue;
    const [key, ...rest] = raw.slice(2).split('=');
    args[key] = rest.length ? rest.join('=') : true;
  }
  return args;
}

function isFilled(value) {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (value instanceof Date) return !Number.isNaN(value.getTime());
  if (typeof value === 'string') return value.trim() !== '';
  return true;
}

async function main() {
  const args = parseArgs(process.argv);
  const email = String(args.email || process.env.INSPECT_EMAIL || '').trim().toLowerCase();
  if (!email) {
    throw new Error('Provide --email=someone@example.com');
  }

  await connectDB();

  const user = await User.findOne({ email }).select('_id email fullName diabetes_diagnosed country country_code phone_number date_of_birth gender deleted_at');
  if (!user) {
    console.log('User not found:', email);
    await mongoose.disconnect();
    return;
  }

  const personal = await UserPersonalInfo.findOne({ user_id: user._id });
  const medical = await UserMedicalInfo.findOne({ user_id: user._id });

  const required = {
    fullName: user.fullName,
    date_of_birth: personal?.date_of_birth ?? user.date_of_birth,
    gender: personal?.gender ?? user.gender,
    phone_number: user.phone_number,
    height: personal?.height,
    weight: personal?.weight,
    diabetes_type: medical?.diabetes_type,
    diagnosis_date: medical?.diagnosis_date,
  };

  console.log('User:', {
    email: user.email,
    diabetes_diagnosed: user.diabetes_diagnosed,
    deleted_at: user.deleted_at,
  });

  console.log('Required fields (raw + filled?):');
  for (const [k, v] of Object.entries(required)) {
    const type = v instanceof Date ? 'Date' : Array.isArray(v) ? 'Array' : typeof v;
    console.log(`- ${k}:`, { type, value: v, filled: isFilled(v) });
  }

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('inspect-user-profile failed:', err);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});
