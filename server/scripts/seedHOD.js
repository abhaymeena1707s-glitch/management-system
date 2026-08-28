require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedHOD = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/library_management_db');
    console.log('Connected to DB');

    const existingHOD = await User.findOne({ email: 'hod@library.com' });
    if (!existingHOD) {
      const hodUser = new User({
        memberId: 'HOD-0001',
        name: 'Inventory Manager',
        email: 'hod@library.com',
        password: 'Hod@123',
        role: 'HOD',
        phone: '9876543210',
        status: 'Active'
      });
      await hodUser.save();
      console.log('HOD user created successfully: hod@library.com / Hod@123');
    } else {
      // Force update password to ensure it is Hod@123
      existingHOD.password = 'Hod@123';
      await existingHOD.save();
      console.log('HOD user already exists! Password updated to Hod@123.');
    }
  } catch (error) {
    console.error('Error seeding HOD:', error);
  } finally {
    mongoose.disconnect();
  }
};

seedHOD();
