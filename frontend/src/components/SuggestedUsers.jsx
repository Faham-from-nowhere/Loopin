import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

const SuggestedUsers = () => {
    const { suggestedUsers = [], user } = useSelector(store => store.auth);
    const [followedIds, setFollowedIds] = useState(user?.following || []);

    const handleFollow = async (targetUserId) => {
        try {
            const res = await axios.post(`http://localhost:8000/api/v1/user/followorunfollow/${targetUserId}`, {}, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
                if (followedIds.includes(targetUserId)) {
                    setFollowedIds(followedIds.filter(id => id !== targetUserId));
                } else {
                    setFollowedIds([...followedIds, targetUserId]);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error following user');
        }
    }
    return (
        <div className="my-10">
            <div className="flex items-center justify-between text-sm w-full">
                <h1 className="font-semibold text-gray-600">Suggested for you</h1>
                <span className="font-medium cursor-pointer">See All</span>
            </div>
            {
                suggestedUsers.map((user) => {
                    return (
                        <div key={user._id} className="flex items-center justify-between my-5">
                            <div className='flex items-center gap-2'>
                                <Link to={`/profile/${user?._id}`}>
                                    <Avatar>
                                        <AvatarImage src={user?.profilePicture} alt="post_image" />
                                        <AvatarFallback>MF</AvatarFallback>
                                    </Avatar>
                                </Link>
                                <div>
                                    <h1 className="text-sm font-semibold"><Link to={`/profile/${user?._id}`}>{user?.username}</Link></h1>
                                    <span className="text-gray-600 text-sm">{user?.bio || 'Bio here...'}</span>
                                </div>
                            </div>
                            <span onClick={() => handleFollow(user._id)} className={`text-xs font-bold cursor-pointer ${followedIds.includes(user._id) ? 'text-gray-500 hover:text-gray-700' : 'text-[#3BADF8] hover:text-[#3495d6]'}`}>{followedIds.includes(user._id) ? 'Unfollow' : 'Follow'}</span>
                        </div>
                    )
                })
            }
        </div>
    )
}

export default SuggestedUsers