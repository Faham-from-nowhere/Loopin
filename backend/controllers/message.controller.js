import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import { catchAsync } from "../utils/catchAsync.js";
import { sendNotification } from "../utils/notificationHelper.js";

export const sendMessage = catchAsync(async (req, res, next) => {
        const senderId = req.id;
        const receiverId = req.params.id;
        const {textMessage:message} = req.body;
        let conversation = await Conversation.findOne({
            participants:{$all:[senderId, receiverId]}
        });
        if(!conversation){ //establish convo if not started yet
            conversation = await Conversation.create({
                participants:[senderId, receiverId]
            })
        };
        const newMessage = await Message.create({
            senderId,
            receiverId,
            message
        });
        if(newMessage) conversation.message.push(newMessage._id);
        await Promise.all([conversation.save(), newMessage.save()]);
        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit('newMessage', newMessage);
        }
        
        await sendNotification({
            type: 'message',
            senderId,
            receiverId,
            message: 'Sent you a message'
        });
        
        return res.status(201).json({success:true, newMessage}); 
});

export const getMessage = catchAsync(async (req, res, next) => {
        const senderId = req.id;
        const receiverId = req.params.id;
        const conversation = await Conversation.findOne({
            participants:{$all:[senderId, receiverId]}
        }).populate({
            path: 'message',
            populate: {
                path: 'senderId receiverId',
                select: 'username profilePicture'
            }
        });
        if(!conversation) return res.status(200).json({success:true, messages:[]});
        return res.status(200).json({success:true, messages:conversation?.message});
});