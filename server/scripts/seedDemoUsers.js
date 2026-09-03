require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const demoUsers = [
  {
    name: 'Admin',
    email: 'admin@library.com',
    password: 'Admin@123',
    role: 'Admin'
  },
  {
    name: 'Librarian',
    email: 'librarian@library.com',
    password: 'Librarian@123',
    role: 'Librarian'
  },
  {
    name: 'HOD',
    email: 'hod@library.com',
    password: 'Hod@123',
    role: 'HOD'
  }
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to DB');
    
    for (const u of demoUsers) {
      let user = await User.findOne({ email: u.email });
      if (!user) {
        user = new User(u);
        await user.save();
        console.log(`Created new demo user: ${u.email}`);
      } else {
        user.password = u.password;
        user.role = u.role;
        await user.save();
        console.log(`Updated existing demo user: ${u.email}`);
      }
    }

    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
