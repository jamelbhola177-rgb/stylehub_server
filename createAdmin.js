import './config/env.js';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';

dotenv.config();

const ensureAdmin = async () => {
  try {
    await connectDB();

    const existing = await User.findOne({ email: 'admin@stylehub.com' });
    if (existing) {
      existing.password = 'admin123';
      existing.role = 'admin';
      existing.isActive = true;
      await existing.save();
      console.log('Admin account reset successfully.');
    } else {
      await User.create({
        name: 'Admin User',
        email: 'admin@stylehub.com',
        password: 'admin123',
        role: 'admin',
        phone: '9876543210',
      });
      console.log('Admin account created successfully.');
    }

    console.log('Login with: admin@stylehub.com / admin123');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

ensureAdmin();
