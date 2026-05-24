import {Server} from "socket.io";
import express from "express";
import http from "http";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors:{
        origin: process.env.URL || 'http://localhost:5173',
        methods:['GET', 'POST']
    }
})

const userSocketMap = {} //stores socket id corresonding to user id

export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
}

io.on('connection', (socket)=>{
    const userId = socket.handshake.query.userId;
    if(userId){
        userSocketMap[userId] = socket.id;
        socket.join(`user_${userId}`); // Join personal room for notifications
        console.log(`User connected:UserId=${userId}, socketId = ${socket.id}`);
    }
    io.emit('getOnlineUsers', Object.keys(userSocketMap));
    
    socket.on('joinChat', (conversationId) => {
        socket.join(`chat_${conversationId}`);
    });

    socket.on('leaveChat', (conversationId) => {
        socket.leave(`chat_${conversationId}`);
    });

    socket.on('typing', ({ conversationId, senderId }) => {
        socket.to(`chat_${conversationId}`).emit('typing', { senderId });
    });
    
    socket.on('stopTyping', ({ conversationId, senderId }) => {
        socket.to(`chat_${conversationId}`).emit('stopTyping', { senderId });
    });
    
    // Watch party sync
    socket.on('videoAction', ({ action, time, senderId, roomId }) => {
        socket.to(`chat_${roomId}`).emit('videoAction', { action, time, senderId });
    });

    socket.on('disconnect', ()=>{
        if(userId){
            console.log(`User disconnected:UserId=${userId}, socketId = ${socket.id}`);
            delete userSocketMap[userId];
        }
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
    });
})

export{app, server, io};