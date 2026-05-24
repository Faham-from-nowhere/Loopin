import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/user.model.js';
import { Post } from '../models/post.model.js';

dotenv.config({ path: './.env' });

const uri = process.env.MONGO_URI;

(async () => {
  try {
    await mongoose.connect(uri);

    // Find or create a test user
    let user = await User.findOne({ email: 'test-seed@example.com' });
    if (!user) {
      user = await User.create({ username: 'seeduser', email: 'test-seed@example.com', password: 'hashedpassword' });
    }

    // Create a post
    const post = await Post.create({ caption: 'Seed post', image: 'https://via.placeholder.com/800', author: user._id });

    // Attach post to user
    user.posts.push(post._id);
    await user.save();

    console.log('Seeded post:', post._id.toString());
    await mongoose.disconnect();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
