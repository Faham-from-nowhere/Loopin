import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "cloudinary";
import { Post } from "../models/post.model.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/errorHandler.js";
import { sendNotification } from "../utils/notificationHelper.js";
export const register = async (req, res) => {
    try{
        const {username, email, password} = req.body; // Because we need username, email as well as password for registering
        if(!username || !email || !password){
            return res.status(401).json({
                message:"Something is missing. Please check!",
                success: false,
            });
        }
        const user = await User.findOne({email}); // One user per email
        if(user){
            return res.status(401).json({
                message:"Try a different email!",
                success: false, 
            });
        };
        const hashedPassword = await bcrypt.hash(password, 12); // 12 is the salting rounds(hashing complexity factor). Current standard is 12
        await User.create({
            username,
            email,
            password:hashedPassword
        });
        return res.status(201).json({
                message:"Account created successfully!",
                success: true,
        });
    } catch (error) {
        console.log(error);
    }
}



export const login = async (req,res) => {
    try{
       const {email, password} = req.body;
       if(!email || !password){
            return res.status(401).json({
                message:"Something is missing. Please check!",
                success: false,
            });
        }
        let user = await User.findOne({email});
        if(!user){
            return res.status(401).json({
                message:"Incorrect email or password!",
                success: false,
            });
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch){
        return res.status(401).json({
                message:"Incorrect email or password!",
                success: false,
            });
        };
        const token = await jwt.sign({userId:user._id}, process.env.SECRET_KEY, {expiresIn:'1d'}); // Stored for the login duration in a cookie
        //populate each post in the post array
        const populatePost = await Promise.all(// to bypass iterating all posts of user with diff post ids
            user.posts.map( async (postId) => {
                const post = await Post.findById(postId);
                if(post.author.equals(user._id)){
                    return post;
                }
                return null;
            })
        )
        user = {
            _id:user._id,
            username:user.username,
            email:user.email,
            profilePicture:user.profilePicture,
            bio:user.bio,
            followers:user.followers,
            following:user.following,
            posts:populatePost
        }
        return res.cookie('token', token, {httpOnly:true, sameSite:'none', secure:true, maxAge: 1*24*60*60*1000}).json({ // 1 day*24 hrs*60 mins*60 sec*1000 ms
            message:`Welcome back ${user.username}`,
            success:true,
            user
        });
    } catch (error) {
        console.log(error);
    }
}


export const logout = async (_,res) => {
    try{
        return res.cookie("token", "", {maxAge:0, sameSite:'none', secure:true}).json({ //Empty the user token
            message:"Logged out successfully",
            success:true
        });
    } catch (error) {
        console.log(error);
    }
};


export const getProfile = async (req,res) => {
    try{
        const userId = req.params.id;
        let user = await User.findById(userId)
            .populate({
                path:'posts', 
                options: {sort: {createdAt:-1}},
                populate: [
                    { path: 'author', select: 'username profilePicture' },
                    { path: 'comments', sort: { createdAt: -1 }, populate: { path: 'author', select: 'username profilePicture' } }
                ]
            })
            .populate({
                path: 'bookmarks',
                populate: [
                    { path: 'author', select: 'username profilePicture' },
                    { path: 'comments', sort: { createdAt: -1 }, populate: { path: 'author', select: 'username profilePicture' } }
                ]
            });
        
        // Convert to plain object to modify the posts array
        let userObj = user.toObject();
        if (req.id !== userId) {
            userObj.posts = userObj.posts.filter(p => !p.isArchived);
        }

        // Fetch posts where this user is tagged
        const taggedPosts = await Post.find({ taggedUsers: userId, isArchived: { $ne: true } })
            .sort({ createdAt: -1 })
            .populate('author', 'username profilePicture')
            .populate({
                path: 'comments',
                sort: { createdAt: -1 },
                populate: { path: 'author', select: 'username profilePicture' }
            });
            
        userObj.taggedPosts = taggedPosts;

        return res.status(200).json({
            user: userObj,
            success:true
        });        
    } catch (error) {
        console.log(error);
    }
}



export const editProfile = async (req,res) => {
    try{
        const userId = req.id;
        const {bio, gender} = req.body;
        const profilePicture = req.file;
        let cloudResponse;
        if(profilePicture){
            const fileUri = getDataUri(profilePicture);
            cloudResponse = await cloudinary.uploader.upload(fileUri);
        }
        const user = await User.findById(userId).select('-password');
        if(!user){
            return res.status(404).json({
                message:'User not found',
                success:false
            });
        }
        if(bio && bio !== 'undefined'){
            user.bio = bio;
        }
        if(gender && gender !== 'undefined') user.gender = gender;
        if(profilePicture) user.profilePicture = cloudResponse.secure_url;
        await user.save();
        return res.status(200).json({
            message:'Profile Update Successful',
            success:true,
            user
        });
    } catch (error) {
        console.log(error);
    }
}



export const getSuggestedUsers = async (req,res) => {
    try{
        const suggestedUsers = await User.find({_id:{$ne:req.id}}).select("-password") //Find all users with userId not equal to the one and return their info without password
        if(!suggestedUsers){
            return res.status(400).json({
                message:'Not enough users'
            })
        }
        return res.status(200).json({
                success:true,
                users:suggestedUsers
            })
    } catch (error) {
        console.log(error);
    }
}

export const getFollowingUsers = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.id).populate('following', '-password');
    if (!user) {
        return res.status(404).json({ message: 'User not found', success: false });
    }
    return res.status(200).json({ success: true, users: user.following });
});



export const followOrUnfollow = catchAsync(async (req, res, next) => {
    const follower = req.id;
    const followed = req.params.id;
    if (follower === followed) {
        return next(new AppError('You cannot follow/unfollow yourself', 400));
    }
    const user = await User.findById(follower);
    const targetUser = await User.findById(followed);
    if (!user || !targetUser) {
        return next(new AppError('User not found', 404));
    }
    const isFollowing = user.following.some(id => id.toString() === followed.toString());
    
    if (isFollowing) { // Unfollow logic
        await Promise.all([
            User.updateOne({ _id: follower }, { $pull: { following: followed } }),
            User.updateOne({ _id: followed }, { $pull: { followers: follower } })
        ])
        return res.status(200).json({ message: 'Unfollow successful!', success: true });
    } else { // Follow logic
        if (targetUser.isPrivate) {
            // Check if request already sent
            if(targetUser.followRequests.includes(follower)) {
                return res.status(400).json({ message: 'Follow request already sent', success: false });
            }
            await User.updateOne({ _id: followed }, { $push: { followRequests: follower } });
            
            await sendNotification({
                type: 'follow_request',
                senderId: follower,
                receiverId: followed,
                message: 'Requested to follow you'
            });
            return res.status(200).json({ message: 'Follow request sent!', success: true });
        } else {
            await Promise.all([
                User.updateOne({ _id: follower }, { $push: { following: followed } }),
                User.updateOne({ _id: followed }, { $push: { followers: follower } })
            ]);
            
            await sendNotification({
                type: 'follow',
                senderId: follower,
                receiverId: followed,
                message: 'Started following you'
            });
            
            return res.status(200).json({ message: 'Follow successful!', success: true });
        }
    }
});

export const togglePrivacy = catchAsync(async (req, res, next) => {
    const userId = req.id;
    const user = await User.findById(userId);
    user.isPrivate = !user.isPrivate;
    await user.save();
    return res.status(200).json({ message: `Account is now ${user.isPrivate ? 'private' : 'public'}`, success: true, isPrivate: user.isPrivate });
});

export const acceptFollowRequest = catchAsync(async (req, res, next) => {
    const userId = req.id;
    const requesterId = req.params.id;

    const user = await User.findById(userId);
    if (!user.followRequests.includes(requesterId)) {
        return res.status(400).json({ message: 'No follow request found', success: false });
    }

    await Promise.all([
        User.updateOne({ _id: requesterId }, { $push: { following: userId } }),
        User.updateOne({ _id: userId }, { $push: { followers: requesterId }, $pull: { followRequests: requesterId } })
    ]);

    await sendNotification({
        type: 'follow',
        senderId: userId,
        receiverId: requesterId,
        message: 'Accepted your follow request'
    });

    return res.status(200).json({ message: 'Follow request accepted', success: true });
});

export const rejectFollowRequest = catchAsync(async (req, res, next) => {
    const userId = req.id;
    const requesterId = req.params.id;

    await User.updateOne({ _id: userId }, { $pull: { followRequests: requesterId } });

    return res.status(200).json({ message: 'Follow request rejected', success: true });
});

export const searchUsers = catchAsync(async (req, res, next) => {
    const { query } = req.query;
    if (!query) {
        return next(new AppError('Query parameter is required', 400));
    }
    const users = await User.find({
        username: { $regex: query, $options: 'i' }
    }).select("-password");
    return res.status(200).json({ success: true, users });
});