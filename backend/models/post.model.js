import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    caption:{type:String, default:''},
    image:{type:String, required:true},
    author:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    likes:[{type:mongoose.Schema.Types.ObjectId, ref:'User'}],
    comments:[{type:mongoose.Schema.Types.ObjectId, ref:'Comment'}],
    embedding: { type: [Number], index: '2dsphere' }, // Storing Gemini vector embeddings
    isArchived: { type: Boolean, default: false },
    taggedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
},{
    timestamps:true
});

export const Post = mongoose.model('Post', postSchema);