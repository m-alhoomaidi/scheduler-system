require('dotenv').config()


const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const MONGO_URI =
  process.env.MONGO_URI
  if(!MONGO_URI){
    console.error('The MONGO_URI is not setted up')
  }

  
const userSchema = new mongoose.Schema({
  ssuuid: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🌱 Connected to MongoDB');

    const ssuuid = '1234567890';
    const username = 'vrtx1234';
    const plainPassword = 'vrtx1234';     
    const hashed = await bcrypt.hash(plainPassword, 10);

    const result = await User.findOneAndUpdate(
      { ssuuid },
      { ssuuid, username, password: hashed },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`✅ Seeded user: ${result.username} (id: ${result._id})`);
  } catch (err) {
    console.error('❌ Seeding error:', err);
  } finally {
    
    await mongoose.disconnect();
    console.log('🛑 Disconnected from MongoDB');
  }
}

run();
