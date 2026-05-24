import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useSelector } from "react-redux";
import useGetAllMessage from "@/hooks/useGetAllMessage";
import useGetRTM from "@/hooks/useGetRTM";
import { useEffect, useRef } from "react";

const Messages = ({ selectedUser }) => {
    useGetRTM();
    useGetAllMessage();
    const {messages} = useSelector(store=>store.chat);
    const { user } = useSelector(store => store.auth);
    const scrollRef = useRef();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);
    
    return (
        <div className="overflow-y-auto flex-1 p-4">
            <div className="flex justify-center mb-4">
                <div className="flex flex-col items-center justify-center">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={selectedUser?.profilePicture} alt="profile" />
                        <AvatarFallback>MF</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold mt-2">{selectedUser?.username}</span>
                    <Link to={`/profile/${selectedUser?._id}`}><Button className="my-2 h-8" variant="secondary">View Profile</Button></Link>
                </div>
            </div>
            <div className="flex flex-col gap-3">
                {
                    messages && messages.length > 0 ? (
                        messages.map((msg, index) => {
                            const isSentByCurrentUser = msg.senderId === user?._id || msg.senderId?._id === user?._id;
                            const isLastMessage = index === messages.length - 1;
                            return (
                                <div ref={isLastMessage ? scrollRef : null} key={msg._id} className={`flex ${isSentByCurrentUser ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs px-4 py-2 rounded-lg break-words ${
                                        isSentByCurrentUser 
                                            ? 'bg-blue-500 text-white rounded-br-none text-white' 
                                            : 'bg-gray-200 text-black rounded-bl-none text-blue'
                                    }`}>
                                        <p>{msg.message}</p>
                                        <span className="text-xs opacity-70 mt-1 block">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="text-center text-gray-500">No messages yet</div>
                    )
                }
            </div>
        </div>
    )
}

export default Messages