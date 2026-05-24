import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js"
import { User } from "../models/user.model.js";
import Comment from "../models/comment.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import { AppError } from "../utils/errorHandler.js";
import { sendNotification } from "../utils/notificationHelper.js";
import { generateCaption, moderateContent, generateEmbedding } from "../services/ai.service.js";
import { catchAsync } from "../utils/catchAsync.js";

export const addNewPost = catchAsync(async (req, res, next) => {
    const { caption, useAiCaption } = req.body;
    const image = req.file;
    const authorId = req.id;
    if (!image) {
        return next(new AppError('Image required', 400));
    }
    
    // Content Moderation
    const isAppropriate = await moderateContent(caption);
    if (!isAppropriate) {
        return next(new AppError('Content violates moderation policy', 400));
    }
    
    // AI Caption Generator
    let finalCaption = caption;
    if (useAiCaption === 'true' || useAiCaption === true) {
        finalCaption = await generateCaption(caption);
    }
    
    let fileUri = "";
    if (image.mimetype.startsWith('video/')) {
        fileUri = `data:${image.mimetype};base64,${image.buffer.toString('base64')}`;
    } else {
        const optimizedImageBuffer = await sharp(image.buffer)
            .resize({width:800,height:800,fit:'inside'})
            .toFormat('jpeg',{quality:80})
            .toBuffer();
        fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
    }
    
    const cloudResponse = await cloudinary.uploader.upload(fileUri, { resource_type: "auto" });
    
    // Generate Embeddings for Smart Feed
    const embedding = await generateEmbedding(finalCaption);
    
    // Extract tagged users from caption (e.g. @username)
    const taggedUsernames = finalCaption.match(/@\w+/g)?.map(u => u.slice(1)) || [];
    const taggedUsersDocs = await User.find({ username: { $in: taggedUsernames } }).select('_id');
    const taggedUsers = taggedUsersDocs.map(u => u._id);

    const post = await Post.create({
        caption: finalCaption,
        image: cloudResponse.secure_url,
        author: authorId,
        embedding, // save embedding
        taggedUsers
    });
        const user = await User.findById(authorId);
        if(user){
            user.posts.push(post._id);
            await user.save();
        }
        await post.populate({path:'author', select:'-password'}); // populate the post info in the post model schema
        return res.status(201).json({
        message: 'New post added',
        post,
        success: true
    });
});



export const getAllPost = catchAsync(async (req, res, next) => {
    const currentUserId = req.id;
    const currentUser = await User.findById(currentUserId).select('following');
    const followingIds = currentUser ? currentUser.following.map(id => id.toString()) : [];

    let posts = await Post.find({ isArchived: { $ne: true } })
        .sort({ createdAt: -1 })
        .populate({
            path: 'author',
            select: 'username profilePicture isPrivate'
        })
        .populate({
            path: 'comments',
            options: { sort: { createdAt: -1 } },
            populate: {
                path: 'author',
                select: 'username profilePicture'
            }
        });

    posts = posts.filter(post => {
        if (!post.author) return false;
        if (!post.author.isPrivate || post.author._id.toString() === currentUserId) return true;
        return followingIds.includes(post.author._id.toString());
    });

    return res.status(200).json({ success: true, posts });
});

const cosineSimilarity = (vecA, vecB) => {
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
    let dotProduct = 0, normA = 0, normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

export const getSmartFeed = catchAsync(async (req, res, next) => {
    const userId = req.id;
    
    // 1. Fetch posts the user has liked to build a user profile embedding
    const likedPosts = await Post.find({ likes: userId, embedding: { $exists: true, $ne: [] }, isArchived: { $ne: true } }).limit(10);
    
    const currentUser = await User.findById(userId).select('following');
    const followingIds = currentUser ? currentUser.following.map(id => id.toString()) : [];

    let allPosts = await Post.find({ isArchived: { $ne: true } })
        .sort({ createdAt: -1 })
        .limit(100)
        .populate('author', 'username profilePicture isPrivate')
        .populate({
            path: 'comments',
            options: { sort: { createdAt: -1 } },
            populate: { path: 'author', select: 'username profilePicture' }
        });

    allPosts = allPosts.filter(post => {
        if (!post.author) return false;
        if (!post.author.isPrivate || post.author._id.toString() === userId) return true;
        return followingIds.includes(post.author._id.toString());
    });

    if (likedPosts.length > 0) {
        // Calculate average embedding
        const vectorSize = likedPosts[0].embedding.length;
        const avgEmbedding = new Array(vectorSize).fill(0);
        
        likedPosts.forEach(post => {
            for(let i = 0; i < vectorSize; i++) {
                avgEmbedding[i] += post.embedding[i];
            }
        });
        
        for(let i = 0; i < vectorSize; i++) {
            avgEmbedding[i] /= likedPosts.length;
        }

        // Calculate similarity and sort
        allPosts = allPosts.map(post => {
            const similarity = cosineSimilarity(avgEmbedding, post.embedding);
            return { post, similarity };
        }).sort((a, b) => b.similarity - a.similarity).map(item => item.post).slice(0, 20);
        
    } else {
        // Fallback: Just return top 20 recent/popular if no likes
        allPosts = allPosts.slice(0, 20);
    }

    return res.status(200).json({ success: true, posts: allPosts });
});


export const getUserPost = async (req, res) => {
    try {
        const authorId = req.id;

        const posts = await Post.find({ author: authorId, isArchived: { $ne: true } })
            .sort({ createdAt: -1 })
            .populate({
                path: 'author',
                select: 'username profilePicture'
            })
            .populate({
                path: 'comments',
                options: { sort: { createdAt: -1 } },
                populate: {
                    path: 'author',
                    select: 'username profilePicture'
                }
            });

        return res.status(200).json({
            posts,
            success: true
        });

    } catch (error) {
        console.log("GET USER POST ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



export const likePost = async (req,res) => {
    try{
        const liker = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message:'Post not found', success:false});
        //like logic
        await post.updateOne({$addToSet:{likes:liker}}); // addToSet only allows for 1 like count per user
        await post.save();
        const postOwnerId = post.author.toString();
        if(postOwnerId!== liker){
            await sendNotification({
                type: 'like',
                senderId: liker,
                receiverId: postOwnerId,
                postId: postId,
                message: 'Liked your post'
            });
        }
        return res.status(200).json({message:'Post Liked', success:true});
    } catch (error) {
        console.log(error);
    }
}



export const dislikePost = async (req,res) => {
    try{
        const liker = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message:'Post not found', success:false});
        //like logic
        await post.updateOne({$pull:{likes:liker}}); // pull just deletes from the set
        await post.save();
        const user = await User.findById(liker).select('username profilePicture');
        const postOwnerId = post.author.toString();
        if(postOwnerId!== liker){
            const notification = {
                type:'dislike',
                userId:liker,
                userDetails:user,
                postId,
                message:'Your post was disliked'
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification', notification);
        }
        return res.status(200).json({message:'Post Disliked', success:true});
    } catch (error) {
        console.log(error);
    }
}



export const addComment = async (req,res) => {
    try{
        const postId = req.params.id;
        const commenter = req.id;
        const {text} = req.body;
        const post = await Post.findById(postId);
        if(!text) return res.status(400).json({message:'Text is required', success:false});
        const comment = await Comment.create({
            text,
            author:commenter,
            post:postId
        });
        await comment.populate({path:'author', select:'username profilePicture'});
        post.comments.push(comment._id); // _id used to refer to Pk in mongoose db and full thing pushed to it 
        await post.save();
        
        const postOwnerId = post.author.toString();
        if (postOwnerId !== commenter) {
            await sendNotification({
                type: 'comment',
                senderId: commenter,
                receiverId: postOwnerId,
                postId: postId,
                message: 'Commented on your post'
            });
        }
        
        // Extract tagged users from comment text
        const taggedUsernames = text.match(/@\w+/g)?.map(u => u.slice(1)) || [];
        if (taggedUsernames.length > 0) {
            const taggedUsersDocs = await User.find({ username: { $in: taggedUsernames } }).select('_id');
            const taggedUsers = taggedUsersDocs.map(u => u._id);
            
            // Add these to the post's taggedUsers array
            await post.updateOne({ $addToSet: { taggedUsers: { $each: taggedUsers } } });
            
            // Send notification to tagged users
            for (const tUser of taggedUsersDocs) {
                if (tUser._id.toString() !== commenter && tUser._id.toString() !== postOwnerId) {
                    await sendNotification({
                        type: 'comment',
                        senderId: commenter,
                        receiverId: tUser._id.toString(),
                        postId: postId,
                        message: 'Tagged you in a comment'
                    });
                }
            }
        }
        
        return res.status(201).json({message:'Comment Added', comment, success:true});
    } catch (error) {
        console.log(error);
    }
}



export const getPostComments = async (req, res) => {
    try {
        const postId = req.params.id;

        const comments = await Comment.find({ post: postId })
            .populate('author', 'username profilePicture');

        if (comments.length === 0) {
            return res.status(404).json({
                message: 'No comments found for this post',
                success: false
            });
        }

        return res.status(200).json({
            success: true,
            comments
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: 'Server error',
            success: false
        });
    }
};



export const deletePost = async (req,res) => {
    try{
        const postId = req.params.id;
        const authorId = req.id;
        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message:'Post not found', success:false});
        if(post.author.toString() !== authorId) return res.status(403).json({message:'Unauthorised'}); //Check if logged in user is post owner
        await Post.findByIdAndDelete(postId); //delete post
        let user = await User.findById(authorId);
        user.posts = user.posts.filter(id => id.toString() !== postId); //Return all posts which dont have deleted post's id
        await user.save();
        await Comment.deleteMany({post:postId}); //delete all comments linked to that post
        return res.status(200).json({message:'Post deleted', success:true});
    }catch (error){
        console.log(error);
    }
}



export const bookmarkPost = async (req,res) => {
    try{
        const postId = req.params.id;
        const authorId = req.id;
        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message:'Post not found', success:false});
        const user = await User.findById(authorId);
        if(user.bookmarks.includes(post._id)){ // already bookmarked, remove from bookmark
            await user.updateOne({$pull:{bookmarks:post._id}});
            await user.save();
            return res.status(200).json({type:'unsaved', message:'Post removed from bookmark', success:true});
        }else{
            await user.updateOne({$addToSet:{bookmarks:post._id}});
            await user.save();
            return res.status(200).json({type:'saved', message:'Post bookmarked', success:true});
        }
    }catch (error){
        console.log(error);
    }
}

export const archivePost = catchAsync(async (req, res, next) => {
    const postId = req.params.id;
    const authorId = req.id;

    const post = await Post.findById(postId);
    if (!post) {
        return next(new AppError('Post not found', 404));
    }

    if (post.author.toString() !== authorId) {
        return next(new AppError('Unauthorized', 403));
    }

    post.isArchived = !post.isArchived;
    await post.save();

    return res.status(200).json({
        success: true,
        message: post.isArchived ? 'Post archived successfully' : 'Post unarchived successfully',
        isArchived: post.isArchived
    });
});

export const deleteComment = catchAsync(async (req, res, next) => {
    const commentId = req.params.id;
    const authorId = req.id;
    const comment = await Comment.findById(commentId);
    if (!comment) return next(new AppError('Comment not found', 404));
    
    const post = await Post.findById(comment.post);
    if (comment.author.toString() !== authorId && post.author.toString() !== authorId) {
        return next(new AppError('Unauthorized to delete this comment', 403));
    }
    
    await Comment.findByIdAndDelete(commentId);
    await Post.updateOne({ _id: comment.post }, { $pull: { comments: commentId } });
    
    return res.status(200).json({ message: 'Comment deleted', success: true });
});

export const editComment = catchAsync(async (req, res, next) => {
    const commentId = req.params.id;
    const authorId = req.id;
    const { text } = req.body;
    
    if (!text) return next(new AppError('Text is required', 400));
    
    const comment = await Comment.findById(commentId);
    if (!comment) return next(new AppError('Comment not found', 404));
    
    if (comment.author.toString() !== authorId) {
        return next(new AppError('Unauthorized to edit this comment', 403));
    }
    
    comment.text = text;
    await comment.save();
    
    return res.status(200).json({ message: 'Comment updated', comment, success: true });
});