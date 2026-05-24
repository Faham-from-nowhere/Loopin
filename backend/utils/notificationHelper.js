import { Notification } from "../models/notification.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import { User } from "../models/user.model.js";

export const sendNotification = async ({ type, senderId, receiverId, postId = null, message }) => {
    try {
        if (senderId.toString() === receiverId.toString()) return; // Don't notify self

        const notification = await Notification.create({
            type,
            sender: senderId,
            receiver: receiverId,
            post: postId,
            message
        });

        const sender = await User.findById(senderId).select('username profilePicture');
        
        const socketNotification = {
            _id: notification._id,
            type,
            sender: senderId,
            userDetails: sender,
            post: postId,
            message,
            isRead: false,
            createdAt: notification.createdAt
        };

        const receiverSocketId = getReceiverSocketId(receiverId.toString());
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('notification', socketNotification);
        }
        
        // Also emit to their personal room
        io.to(`user_${receiverId}`).emit('notification', socketNotification);
    } catch (error) {
        console.error("Error sending notification:", error);
    }
};
