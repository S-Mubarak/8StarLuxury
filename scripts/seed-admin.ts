import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';

const ADMIN_EMAIL = 'admin@8starluxury.com';
const ADMIN_PASSWORD = 'Test@1234';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI is not loaded.');
  console.error('Please ensure .env.local exists and the variable is set.');
  process.exit(1);
}

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error(
    'Error: Please edit ADMIN_EMAIL and ADMIN_PASSWORD in the scripts/seed-admin.ts file.'
  );
  process.exit(1);
}

async function seedAdmin() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI as string);
    console.log('Database connected.');

    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      console.log('Admin user already exists.');
      mongoose.connection.close();
      return;
    }

    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    console.log('Creating new admin user...');
    const adminUser = new User({
      name: 'Admin',
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
    });

    await adminUser.save();

    console.log('✅ Admin user created successfully!');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: (the one you set in the script)`);
  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

seedAdmin();
