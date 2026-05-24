import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Post } from '../models/post.model.js';
import { User } from '../models/user.model.js';

dotenv.config({ path: './.env' });

const uri = process.env.MONGO_URI;

(async () => {
  try {
    await mongoose.connect(uri);
    const count = await Post.countDocuments();
    const recent = await Post.find().limit(5).populate('author', 'username email').lean();
    console.log('postCount:', count);
    console.log('recentPosts:', recent);
    await mongoose.disconnect();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
