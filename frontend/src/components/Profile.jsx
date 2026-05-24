import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import useGetUserProfile from "@/hooks/useGetUserProfile";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { AtSign, Heart, MessageCircle } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { setAuthUser, setSelectedUser } from "@/redux/authSlice";
import { setSelectedPost } from "@/redux/postSlice";
import CommentDialog from "./CommentDialog";

const Profile = () => {
    const params = useParams();
    const navigate = useNavigate();
    const userId = params.id;
    useGetUserProfile(userId);
    const [activeTab, setActiveTab] = useState('posts');
    const [openPostDialog, setOpenPostDialog] = useState(false);
    const { userProfile, user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const isLoggedInUserProfile = user?._id === userProfile?._id;
    const isFollowing = user?.following?.includes(userProfile?._id);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    }

    const followOrUnfollowHandler = async () => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/user/followorunfollow/${userProfile?._id}`, {}, { withCredentials: true });
            if (res.data.success) {
                const updatedUserData = {
                    ...user,
                    following: isFollowing
                        ? user.following.filter(id => id !== userProfile?._id)
                        : [...user.following, userProfile?._id]
                };
                dispatch(setAuthUser(updatedUserData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || 'An error occurred');
        }
    }

    const displayedPost = activeTab === 'posts' 
        ? userProfile?.posts?.filter(p => !p.isArchived) 
        : activeTab === 'saved' ? userProfile?.bookmarks
        : activeTab === 'archive' ? userProfile?.posts?.filter(p => p.isArchived)
        : activeTab === 'tags' ? userProfile?.taggedPosts
        : [];

    return (
        <div className="flex max-w-5xl justify-center mx-auto pl-10">
            <div className="flex flex-col gap-20 p-8">
                <div className="grid grid-cols-2 ">
                    <section className="flex items-center justify-center">
                        <Avatar className="h-32 w-32">
                            <AvatarImage src={userProfile?.profilePicture} alt="profilePhoto" />
                            <AvatarFallback>MF</AvatarFallback>
                        </Avatar>
                    </section>
                    <section>
                        <div className="flex flex-col gap-5">
                            <div className="flex items-center gap-2">
                                <span>{userProfile?.username}</span>
                                {
                                    isLoggedInUserProfile ? (
                                        <>
                                            <Link to="/account/edit"><Button variant="secondary" className="border-[2px] border-gray-400 rounded-[10px] hover:bg-gray-200 h-8">Edit Profile</Button></Link>
                                            <Button onClick={() => handleTabChange('archive')} variant="secondary" className={`border-[2px] border-gray-400 rounded-[10px] hover:bg-gray-200 h-8 ${activeTab === 'archive' ? 'bg-gray-200' : ''}`}>View Archive</Button>
                                            <Button variant="secondary" className="border-[2px] border-gray-400 rounded-[10px] hover:bg-gray-200 h-8">Ad tools</Button>
                                        </>
                                    ) : (
                                        isFollowing ? (
                                            <>
                                            <Button onClick={followOrUnfollowHandler} variant="secondary" className="border-[2px] border-gray-400 rounded-[10px] h-8">Unfollow</Button>
                                            <Button onClick={() => { dispatch(setSelectedUser(userProfile)); navigate('/chat'); }} variant="secondary" className="border-[2px] border-gray-400 rounded-[10px] h-8">Message</Button>
                                            </>
                                        ) :(
                                            <Button onClick={followOrUnfollowHandler} className="bg-[#0095F6] hover:bg-[#3192d2] h-8">Follow</Button>
                                        )  
                                    )
                                }
                            </div>
                            <div className="flex items-center gap-4">
                                <p><span className="font-semibold">{userProfile?.posts.length}</span> posts</p>
                                <p><span className="font-semibold">{userProfile?.followers.length}</span> followers</p>
                                <p><span className="font-semibold">{userProfile?.following.length}</span> following</p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="font-semibold">{userProfile?.bio || 'Bio Here...'}</span>
                                <Badge className="w-fit" variant="secondary"><AtSign/><span className="pl-1">{userProfile?.username}</span></Badge>
                                <span>🙌Some people wait for the stars to align. Others become the gravity</span>
                                <span>😎I bring peace wherever I go. Usually because I leave</span>
                                <span>🐦‍🔥Nothing humbles humanity faster than a weak wifi signal</span>
                            </div>
                        </div>
                    </section>
                </div>
                <div className="border-t vorder-t-gray-200">
                    <div className="flex items-center justify-center gap-10 text-sm">
                        <span className={`py-3 cursor-pointer ${activeTab === 'posts' ? 'font-bold' : ''}`} onClick={()=> handleTabChange('posts')}>
                            POSTS
                        </span>
                        <span className={`py-3 cursor-pointer ${activeTab === 'saved' ? 'font-bold' : ''}`} onClick={()=> handleTabChange('saved')}>
                            SAVED
                        </span>
                        <span className={`py-3 cursor-pointer ${activeTab === 'reels' ? 'font-bold' : ''}`} onClick={()=> handleTabChange('reels')}>
                            REELS
                        </span>
                        <span className={`py-3 cursor-pointer ${activeTab === 'tags' ? 'font-bold' : ''}`} onClick={()=> handleTabChange('tags')}>
                            TAGS
                        </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                        {
                            (activeTab === 'posts' || activeTab === 'saved' || activeTab === 'archive' || activeTab === 'tags') ? (
                                displayedPost?.length === 0 ? <p className="col-span-3 text-center mt-10 text-gray-500">No {activeTab} yet.</p> :
                                displayedPost?.map((post) => {
                                    return(
                                        <div key={post?._id} className="relative group cursor-pointer" onClick={() => {
                                            dispatch(setSelectedPost(post));
                                            setOpenPostDialog(true);
                                        }}>
                                            <img src={post.image} alt="postImage" className="rounded-sm my-2 aspect-square w-full object-cover"/>
                                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-50 transition-opacity duration-300">
                                                <div className="flex items-center text-white space-x-4">
                                                    <button className="flex items-center gap-2 hover:text-gray-300">
                                                        <Heart/>
                                                        <span>{post?.likes.length}</span>
                                                    </button>
                                                    <button className="flex items-center gap-2 hover:text-gray-300">
                                                        <MessageCircle/>
                                                        <span>{post?.comments.length}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <p className="col-span-3 text-center mt-10 text-gray-500">
                                    {activeTab === 'reels' ? 'Reels functionality coming soon.' : 'No tagged posts yet.'}
                                </p>
                            )
                        }
                    </div>
                    </div>
                </div>
            <CommentDialog open={openPostDialog} setOpen={setOpenPostDialog} />
        </div>
    )
}

export default Profile
