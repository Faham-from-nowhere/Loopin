import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/user.model.js';
import { Post } from '../models/post.model.js';

dotenv.config({ path: './.env' });

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: 'test-seed@example.com' });
    if (!user) {
      console.log('No seed user found. Nothing to delete.');
      await mongoose.disconnect();
      return;
    }

    const deletedPosts = await Post.deleteMany({ author: user._id });
    const deletedUser = await User.deleteOne({ _id: user._id });
    console.log('Deleted posts count:', deletedPosts.deletedCount);
    console.log('Deleted seed user count:', deletedUser.deletedCount);
    await mongoose.disconnect();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
