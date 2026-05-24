import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { MessageCircleCode } from "lucide-react";
import { setSelectedUser } from "@/redux/authSlice";
import { setMessages } from "@/redux/chatSlice";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Messages from "./Messages";
import axios from "axios";
import { toast } from "sonner";

const ChatPage = () => {
    const [textMessage, setTextMessage] = useState("");
    const {user, suggestedUsers, selectedUser} = useSelector(store=>store.auth);
    const {onlineUsers, messages} = useSelector(store=>store.chat);
    const dispatch = useDispatch();

    // Fetch messages when selectedUser changes
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                if(selectedUser?._id) {
                    const res = await axios.get(`\${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/message/all/${selectedUser?._id}`, {
                        withCredentials: true
                    });
                    if(res.data.success) {
                        setMessages(res.data.messages);
                    }
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetchMessages();
    }, [selectedUser]);

    const sendMessageHandler = async () => {
        try {
            if(!textMessage.trim()) {
                toast.error("Message cannot be empty");
                return;
            }
            const res = await axios.post(`\${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/message/send/${selectedUser?._id}`, 
                { textMessage },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            );
            if(res.data.success) {
                dispatch(setMessages([...messages, res.data.newMessage]));
                setTextMessage("");
                toast.success("Message sent");
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Failed to send message");
        }
    };

    useEffect(()=>{
        return () => {
            dispatch(setSelectedUser(null));
        }
    }, []);

    return (
        <div className="flex h-screen ml-[16%]">
            <section className="w-full md:w-1/4 my-8">
                <h1 className="font-bold mb-4 px-3 text-xl">{user?.username}</h1>
                <hr className="mb-4 border-gray-100"/>
                <div className="overflow-y-auto h-[80vh]">
                    {
                        suggestedUsers.map((suggestedUser)=> {
                            const isOnline = onlineUsers.includes(suggestedUser?._id);
                            return(
                                <div key={suggestedUser?._id} onClick={() => dispatch(setSelectedUser(suggestedUser))} className="flex gap-3 items-center hover:bg-gray-50 cursor-pointer p-3">
                                    <Avatar>
                                        <AvatarImage src={suggestedUser?.profilePicture} />
                                        <AvatarFallback>MF</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{suggestedUser?.username}</span>
                                        <span className={`text-xs font-bold ${isOnline ? 'text-green-600' : 'text-red-600'}`}>{isOnline? 'online':'offline'}</span>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </section>
            {
                selectedUser?(
                    <section className="flex-1 border-l border-l-gray-300 flex flex-col h-full">
                        <div className="flex gap-3 items-center px-3 py-2 border-b border-gray-300 sticky top-0 bg-white z-10">
                            <Avatar className='w-14 h-14'>
                                <AvatarImage src={selectedUser?.profilePicture} alt='profile' />
                                <AvatarFallback>MF</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span>{selectedUser?.username}</span>
                            </div>
                        </div>
                        <Messages selectedUser = {selectedUser} messages={messages}/>
                        <div className="flex items-center gap-2 p-4 border-t border-t-gray-300">
                            <Input 
                                type="text" 
                                value={textMessage}
                                onChange={(e) => setTextMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessageHandler()}
                                className='flex-1 focus-visible:ring-transparent' 
                                placeholder="Messages..."/>
                            <Button onClick={() => sendMessageHandler(selectedUser?._id)} className="bg-black text-white">Send</Button>
                        </div>
                    </section>
                ):(
                    <div className="flex flex-col items-center justify-center mx-auto">
                        <MessageCircleCode className="w-32 h-32 my-4"/>
                        <h1 className="font-medium text-xl">Your Messages</h1>
                        <span>Send a message to start a conversation.</span>
                    </div>
                )
            }
        </div>
    )
}

export default ChatPage;