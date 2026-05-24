import { Story } from "../models/story.model.js";
import { User } from "../models/user.model.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/errorHandler.js";
import cloudinary from "../utils/cloudinary.js";
import sharp from "sharp";

export const addStory = catchAsync(async (req, res, next) => {
    const authorId = req.id;
    const image = req.file;
    if (!image) return next(new AppError('Image is required for a story', 400));
    
    const optimizedImageBuffer = await sharp(image.buffer)
        .resize({ width: 1080, height: 1920, fit: 'inside' })
        .toFormat('jpeg', { quality: 80 })
        .toBuffer();
    
    const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
    const cloudResponse = await cloudinary.uploader.upload(fileUri);
    
    // Set expiration to 24 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    const story = await Story.create({
        author: authorId,
        media: cloudResponse.secure_url,
        expiresAt
    });
    
    await story.populate('author', 'username profilePicture');
    
    res.status(201).json({ success: true, message: 'Story added', story });
});

export const getStories = catchAsync(async (req, res, next) => {
    const userId = req.id;
    const user = await User.findById(userId);
    
    // Get stories from people the user follows, plus their own stories
    const targetUsers = [...user.following, userId];
    
    // Fetch stories that have not expired yet
    const stories = await Story.find({
        author: { $in: targetUsers },
        expiresAt: { $gt: new Date() }
    })
    .populate('author', 'username profilePicture')
    .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, stories });
});

export const viewStory = catchAsync(async (req, res, next) => {
    const storyId = req.params.id;
    const userId = req.id;
    
    const story = await Story.findById(storyId);
    if (!story) return next(new AppError('Story not found', 404));
    
    if (!story.views.includes(userId)) {
        story.views.push(userId);
        await story.save();
    }
    
    res.status(200).json({ success: true, message: 'Story viewed' });
});
