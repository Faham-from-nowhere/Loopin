import mongoose from "mongoose";

const reelSchema = new mongoose.Schema({
    caption: { type: String, default: '' },
    videoUrl: { type: String, required: true },
    authors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }], // Supports collaborative reels
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    embedding: { type: [Number], index: '2dsphere' } // Storing Gemini vector embeddings
}, {
    timestamps: true
});

export const Reel = mongoose.model('Reel', reelSchema);
