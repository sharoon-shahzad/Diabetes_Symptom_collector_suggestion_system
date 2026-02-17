import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { ensureRolesExist } from '../utils/roleUtils.js';
import { User } from '../models/User.js';
import { Role } from '../models/Role.js';
import { UsersRoles } from '../models/User_Role.js';

function parseArgs(argv) {
  const args = {};
  for (const raw of argv.slice(2)) {
    if (!raw.startsWith('--')) continue;
    const [key, ...rest] = raw.slice(2).split('=');
    const value = rest.length ? rest.join('=') : true;
    args[key] = value;
  }
  return args;
}

function toEmailList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value)
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
}

async function ensureUserHasRole({ userId, roleId }) {
  const existing = await UsersRoles.findOne({ user_id: userId, role_id: roleId });
  if (existing) {
    if (existing.deleted_at != null) {
      existing.deleted_at = null;
      await existing.save();
      return { created: false, restored: true };
    }
    return { created: false, restored: false };
  }

  await UsersRoles.create({ user_id: userId, role_id: roleId, deleted_at: null });
  return { created: true, restored: false };
}

async function softDisableDanglingMappings() {
  const mappings = await UsersRoles.find({ deleted_at: null })
    .populate('user_id')
    .populate('role_id');

  const dangling = mappings.filter(m => !m.user_id || !m.role_id);
  if (dangling.length === 0) {
    return { disabledCount: 0 };
  }

  const now = new Date();
  await Promise.all(
    dangling.map(async (m) => {
      m.deleted_at = now;
      await m.save();
    })
  );

  return { disabledCount: dangling.length };
}

async function main() {
  const args = parseArgs(process.argv);
  const dryRun = args.dryRun === true || String(args.dryRun || '').toLowerCase() === 'true';

  const superAdminEmail = (
    String(args.superAdminEmail || process.env.REPAIR_SUPER_ADMIN_EMAIL || '221429@students.au.edu.pk')
  ).trim().toLowerCase();

  const adminEmails = toEmailList(args.adminEmails || process.env.REPAIR_ADMIN_EMAILS || 'admin@diavise.com');

  console.log('🛠️  Repair admin roles / soft-delete issues');
  console.log('   dryRun:', dryRun);
  console.log('   superAdminEmail:', superAdminEmail);
  console.log('   adminEmails:', adminEmails.join(', ') || '(none)');
  console.log('');

  await connectDB();
  await ensureRolesExist();

  const userRoles = await Role.find({ role_name: 'user', deleted_at: null }).select('_id role_name');
  const adminRoles = await Role.find({ role_name: 'admin', deleted_at: null }).select('_id role_name');
  const superAdminRoles = await Role.find({ role_name: 'super_admin', deleted_at: null }).select('_id role_name');

  if (userRoles.length === 0 || adminRoles.length === 0 || superAdminRoles.length === 0) {
    throw new Error('Required roles not found after ensureRolesExist()');
  }

  const userRoleId = userRoles[0]._id;
  const adminRoleId = adminRoles[0]._id;
  const superAdminRoleId = superAdminRoles[0]._id;

  // 1) Restore the primary super admin user if it was soft-deleted
  const superAdminUser = await User.findOne({ email: superAdminEmail });
  if (!superAdminUser) {
    console.log('⚠️  Super admin user not found:', superAdminEmail);
  } else {
    const wasDeleted = superAdminUser.deleted_at != null;
    if (wasDeleted) {
      console.log('✅ Found super admin user soft-deleted at:', superAdminUser.deleted_at);
      if (!dryRun) {
        superAdminUser.deleted_at = null;
        await superAdminUser.save();
        console.log('✅ Restored super admin user (deleted_at cleared)');
      } else {
        console.log('🧪 dryRun: would clear deleted_at for super admin user');
      }
    } else {
      console.log('✅ Super admin user is active (not soft-deleted)');
    }

    // Ensure role mapping exists
    const existingAnySuperAdmin = await UsersRoles.findOne({
      user_id: superAdminUser._id,
      role_id: { $in: superAdminRoles.map(r => r._id) },
    });

    if (!existingAnySuperAdmin) {
      console.log('⚠️  Super admin user has no super_admin mapping; will create one');
      if (!dryRun) {
        const result = await ensureUserHasRole({ userId: superAdminUser._id, roleId: superAdminRoleId });
        console.log('✅ super_admin mapping ensured:', result);
      } else {
        console.log('🧪 dryRun: would create super_admin mapping');
      }
    } else if (existingAnySuperAdmin.deleted_at != null) {
      console.log('⚠️  Super admin mapping is soft-deleted; will restore it');
      if (!dryRun) {
        existingAnySuperAdmin.deleted_at = null;
        await existingAnySuperAdmin.save();
        console.log('✅ Restored super_admin mapping');
      } else {
        console.log('🧪 dryRun: would restore super_admin mapping');
      }
    } else {
      console.log('✅ Super admin mapping exists');
    }
  }

  // 2) Ensure admin role mappings for intended admin emails
  for (const email of adminEmails) {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('⚠️  Admin user not found:', email);
      continue;
    }

    const existingAnyAdmin = await UsersRoles.findOne({
      user_id: user._id,
      role_id: { $in: adminRoles.map(r => r._id) },
    });

    if (existingAnyAdmin && existingAnyAdmin.deleted_at == null) {
      console.log('✅ Admin mapping exists for:', email);
      continue;
    }

    if (dryRun) {
      console.log('🧪 dryRun: would ensure admin role mapping for:', email);
      continue;
    }

    const result = await ensureUserHasRole({ userId: user._id, roleId: adminRoleId });
    console.log('✅ Admin mapping ensured for:', email, result);
  }

  // 3) Soft-disable dangling mappings (user or role missing)
  if (!dryRun) {
    const { disabledCount } = await softDisableDanglingMappings();
    if (disabledCount > 0) {
      console.log(`✅ Soft-disabled ${disabledCount} dangling Users_Roles mappings`);
    } else {
      console.log('✅ No dangling Users_Roles mappings found');
    }
  } else {
    console.log('🧪 dryRun: would soft-disable dangling Users_Roles mappings');
  }

  // 4) Ensure every active user has at least one active role mapping (default: user)
  const activeUsers = await User.find({ deleted_at: null }).select('_id email');
  const activeUserIds = activeUsers.map(u => u._id);
  const activeMappings = await UsersRoles.find({ user_id: { $in: activeUserIds }, deleted_at: null }).select('user_id');
  const usersWithAnyRole = new Set(activeMappings.map(m => String(m.user_id)));
  const usersMissingRoles = activeUsers.filter(u => !usersWithAnyRole.has(String(u._id)));

  if (usersMissingRoles.length > 0) {
    console.log(`⚠️  ${usersMissingRoles.length} active users have no roles; assigning 'user' role`);
    for (const u of usersMissingRoles) {
      if (dryRun) {
        console.log('🧪 dryRun: would assign user role to:', u.email || String(u._id));
        continue;
      }
      const result = await ensureUserHasRole({ userId: u._id, roleId: userRoleId });
      console.log('✅ user role ensured for:', u.email || String(u._id), result);
    }
  } else {
    console.log('✅ All active users already have at least one role mapping');
  }

  // Quick stats
  const roleDocs = await Role.find({ deleted_at: null }).select('_id role_name');
  const roleNameById = new Map(roleDocs.map(r => [String(r._id), r.role_name]));

  const mappings = await UsersRoles.find({ deleted_at: null }).select('role_id');
  const counts = mappings.reduce((acc, m) => {
    const name = roleNameById.get(String(m.role_id)) || 'unknown';
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  console.log('\n📊 Active Users_Roles counts by role_name:', counts);

  await mongoose.disconnect();
  console.log('\n✅ Done');
}

main().catch(async (err) => {
  console.error('❌ Repair failed:', err);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});
