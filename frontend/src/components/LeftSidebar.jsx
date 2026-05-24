import { Heart, Home, LogOut, MessageCircle, PlusSquare, Search, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import CreatePost from "./CreatePost";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import SearchDialog from "./SearchDialog";
import { useEffect } from "react";
import { setLikeNotification } from "@/redux/rtmSlice";
import appLogo from '@/assets/Logo.jpg';

const LeftSidebar = () => {
    const navigate = useNavigate();
    const {user} = useSelector(store => store.auth);
    const {likeNotification} = useSelector(store=>store.realTimeNotification);
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    
    useEffect(() => {
        const unread = likeNotification?.filter(n => !n.isRead)?.length || 0;
        setUnreadCount(unread);
    }, [likeNotification]);

    const handleNotificationsOpen = async (isOpen) => {
        if (isOpen) {
            setUnreadCount(0);
            try {
                await axios.post('http://localhost:8000/api/v1/notification/mark-all-read', {}, {withCredentials:true});
                dispatch(setLikeNotification(likeNotification.map(n => ({...n, isRead: true}))));
            } catch (error) {
                console.log(error);
            }
        }
    };

    const logoutHandler = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/v1/user/logout', {withCredentials:true});
            if(res.data.success){
                dispatch(setAuthUser(null));
                dispatch(setSelectedPost(null));
                dispatch(setPosts([]));
                dispatch(setLikeNotification([]));
                navigate('/login');
                toast.success(res.data.message);
            }
        } catch (error) {
            const msg = error?.response?.data?.message || error?.message || "Logout failed";
            console.log(msg);
            toast.error(msg);
        }
    }

    const sideBarHandler = (textType) => {
        if(textType === 'Logout') {
            logoutHandler();
        } else if(textType === "Create") {
            setOpen(true);
        } else if(textType === "Profile"){
            navigate(`/profile/${user?._id}`);
        } else if(textType=== "Home"){
            navigate("/");
        } else if(textType=== "Messages") {
            navigate("/chat");
        } else if(textType === "Search") {
            setSearchOpen(true);
        }

    }

    // Fetch historical notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await axios.get('http://localhost:8000/api/v1/notification', { withCredentials: true });
                if (res.data.success) {
                    // Prepend to rtmSlice, avoiding duplicates
                    res.data.notifications.forEach(n => dispatch(setLikeNotification(n)));
                }
            } catch (error) {
                console.log(error);
            }
        };
        if (user) {
            fetchNotifications();
        }
    }, [user, dispatch]);

    const handleFollowRequest = async (id, action) => {
        try {
            const res = await axios.post(`http://localhost:8000/api/v1/user/follow-request/${id}/${action}`, {}, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
                // The backend will send a notification if accepted, which socket will catch
                // For now, let's just reload the notifications or optimistically update UI
                // Simple hack: window.location.reload(); or rely on socket
            }
        } catch (error) {
            toast.error(error.response?.data?.message || `Failed to ${action} request`);
        }
    };

    const sideBarItems = [
    { icon: <Home />, text: "Home" },
    { icon: <Search />, text: "Search" },
    { icon: <MessageCircle />, text: "Messages" },
    { icon: <Heart />, text: "Notifications" },
    { icon: <PlusSquare />, text: "Create" },
    {
        icon: (
            <Avatar className='w-8 h-8'>
                <AvatarImage src={user?.profilePicture} alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
            </Avatar>
        ), text: "Profile"
    },
    { icon: <LogOut />, text: "Logout" }
]
    return (
        <div className='fixed z-10 md:left-0 md:top-0 bottom-0 left-0 w-full md:w-[16%] md:h-screen h-16 bg-white border-t md:border-t-0 md:border-r border-gray-300 px-4 flex md:flex-col items-center md:items-stretch justify-around md:justify-start pb-2 md:pb-0'>
            <div className='flex md:flex-col w-full justify-around md:justify-start items-center md:items-stretch'>
                <img src={appLogo} alt="Logo" className="my-6 pl-3 h-25 w-auto hidden md:block" />
                <div className="flex md:flex-col w-full justify-around md:justify-start">
                    {
                        sideBarItems.map((item, index) => {
                            if (item.text === "Notifications") {
                                return (
                                    <Popover key={index} onOpenChange={handleNotificationsOpen}>
                                        <PopoverTrigger asChild>
                                            <div className='flex items-center gap-3 relative hover:bg-gray-100 cursor-pointer rounded-lg p-2 md:p-3 my-1 md:my-3'>
                                                {item.icon}
                                                <span className="hidden md:block">{item.text}</span>
                                                {unreadCount > 0 && (
                                                    <span className="absolute bottom-6 left-6 h-3 w-3 bg-red-600 rounded-full border-2 border-white"></span>
                                                )}
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent side="right" align="start" className="w-[350px] p-4 bg-white shadow-xl z-50 border border-gray-200 rounded-lg">
                                            <div className="max-h-[400px] overflow-y-auto pr-2">
                                                {
                                                    likeNotification.length === 0 ? (<p>No new notification</p>) : (
                                                        [...new Map(likeNotification.map(item => [item._id || item.userId || Math.random(), item])).values()].map((notification, index)=>{
                                                            const userObj = notification.userDetails || notification.sender;
                                                            return(
                                                                <div key={notification._id || notification.userId || index} 
                                                                     className={`flex items-center gap-3 my-2 justify-between p-3 rounded-lg cursor-pointer transition-colors ${notification.type === 'follow_request' ? 'bg-blue-50 border-l-4 border-blue-500 hover:bg-blue-100' : 'hover:bg-gray-50 border border-transparent'}`}
                                                                     onClick={() => { if(notification.type === 'message') navigate('/chat'); }}>
                                                                    <div className="flex items-center gap-3">
                                                                        <Avatar className="h-10 w-10">
                                                                            <AvatarImage src={userObj?.profilePicture} />
                                                                            <AvatarFallback>MF</AvatarFallback>
                                                                        </Avatar>
                                                                        <div className="text-sm flex flex-col max-w-[180px]">
                                                                            <span className="font-bold truncate">{userObj?.username}</span> 
                                                                            <span className="text-gray-600 line-clamp-2">{notification.message || 'liked your post'}</span>
                                                                        </div>
                                                                    </div>
                                                                    {notification.type === 'follow_request' && (
                                                                        <div className="flex flex-col gap-1 ml-auto">
                                                                            <Button className="h-7 bg-blue-600 hover:bg-blue-700 text-xs" size="sm" onClick={(e) => { e.stopPropagation(); handleFollowRequest(userObj?._id, 'accept'); }}>Accept</Button>
                                                                            <Button className="h-7 text-xs" size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleFollowRequest(userObj?._id, 'reject'); }}>Reject</Button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )
                                                        })
                                                    )
                                                }
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                )
                            }
                            return (
                                <div onClick={() => sideBarHandler(item.text)} key={index} className={`flex items-center gap-3 relative hover:bg-gray-100 cursor-pointer rounded-lg p-2 md:p-3 my-1 md:my-3 ${item.text === 'Logout' ? 'hidden md:flex' : ''}`}>
                                    {item.icon}
                                    <span className="hidden md:block">{item.text}</span>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
            <CreatePost open={open} setOpen={setOpen}/>
            <SearchDialog open={searchOpen} setOpen={setSearchOpen} />
        </div>
    )
}

export default LeftSidebar