import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    media: { type: String, required: true }, // URL of the story media
    expiresAt: { type: Date, required: true },
    views: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// Auto-delete story after expiresAt using MongoDB TTL index
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Story = mongoose.model('Story', storySchema);
