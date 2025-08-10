// seed.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// 1. Configure your MongoDB connection (or pull from env)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/your-db-name';

// 2. Define (or import) your User schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // add any other fields your User model expects (e.g. roles, email, etc.)
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function run() {
  try {
    // 3. Connect
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('🌱 Connected to MongoDB');

    // 4. Prepare your seed user
    const username = 'vrtx';
    const plainPassword = 'vrtx';      // change this to whatever default password you want
    const hashed = await bcrypt.hash(plainPassword, 10);

    // 5. Upsert so you can re-run without duplicates
    const result = await User.findOneAndUpdate(
      { username },
      { username, password: hashed },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`✅ Seeded user: ${result.username} (id: ${result._id})`);
  } catch (err) {
    console.error('❌ Seeding error:', err);
  } finally {
    // 6. Disconnect
    await mongoose.disconnect();
    console.log('🛑 Disconnected from MongoDB');
  }
}

run();
