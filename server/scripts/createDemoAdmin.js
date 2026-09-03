require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to DB');
    let user = await User.findOne({ email: 'admin@gmail.com' });
    if (!user) {
      user = new User({
        name: 'Admin',
        email: 'admin@gmail.com',
        password: 'admin123',
        role: 'Admin'
      });
      await user.save();
      console.log('Created new admin user: admin@gmail.com / admin123');
    } else {
      user.password = 'admin123';
      await user.save();
      console.log('Updated existing admin user password: admin@gmail.com / admin123');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
