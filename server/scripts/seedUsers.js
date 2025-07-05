// Script to seed initial users: admin and regular user
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
  await mongoose.connect(MONGODB_URI);

  const users = [
    {
      username: 'admin',
      password: 'admin123',
      role: 'admin',
    },
    {
      username: 'user',
      password: 'user123',
      role: 'user',
    },
  ];

  for (const u of users) {
    const exists = await User.findOne({ username: u.username });
    if (!exists) {
      const passwordHash = await bcrypt.hash(u.password, 10);
      await User.create({ username: u.username, passwordHash, role: u.role });
      console.log(`Seeded user: ${u.username} (${u.role})`);
    } else {
      console.log(`User already exists: ${u.username}`);
    }
  }

  await mongoose.disconnect();
  console.log('Seeding complete.');
}

seed().catch(e => { console.error(e); process.exit(1); });
