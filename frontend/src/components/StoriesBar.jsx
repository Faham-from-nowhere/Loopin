import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import axios from 'axios';
import { toast } from 'sonner';
import { Dialog, DialogContent } from "./ui/dialog";
import { useSelector } from 'react-redux';

const StoriesBar = () => {
    const { user } = useSelector(store => store.auth);
    const [stories, setStories] = useState([]);
    const [groupedStories, setGroupedStories] = useState({});
    const [viewingStory, setViewingStory] = useState(null);
    const fileRef = useRef();

    const fetchStories = async () => {
        try {
            const res = await axios.get(`\${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/story`, { withCredentials: true });
            if(res.data.success){
                const fetchedStories = res.data.stories;
                setStories(fetchedStories);
                // Group by author ID
                const grouped = {};
                fetchedStories.forEach(s => {
                    const authorId = s.author._id;
                    if(!grouped[authorId]) grouped[authorId] = [];
                    grouped[authorId].push(s);
                });
                setGroupedStories(grouped);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchStories();
    }, []);

    const handleUploadStory = async (e) => {
        const file = e.target.files?.[0];
        if(!file) return;
        const formData = new FormData();
        formData.append('image', file);
        try {
            const res = await axios.post(`\${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/story`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            if(res.data.success){
                toast.success('Story added');
                fetchStories();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload story');
        }
    };

    const handleViewStory = async (story) => {
        setViewingStory(story);
        if(!story.views.includes(user?._id)){
            try {
                await axios.post(`\${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/story/${story._id}/view`, {}, { withCredentials: true });
                // Optimistically update views
                story.views.push(user?._id);
                setStories([...stories]);
            } catch (error) {
                console.error(error);
            }
        }
    };

    const myStories = user ? groupedStories[user._id] : null;
    const otherUsers = Object.keys(groupedStories).filter(id => id !== user?._id);

    return (
        <div className="flex gap-4 overflow-x-auto py-4 mb-4 border-b border-gray-200 scrollbar-hide max-w-2xl mx-auto w-full px-2">
            {/* Current user */}
            <div className="flex flex-col items-center gap-1 cursor-pointer min-w-[70px]" onClick={() => myStories ? handleViewStory(myStories[0]) : fileRef.current?.click()}>
                <input type="file" ref={fileRef} className="hidden" accept="image/*,video/*" onChange={handleUploadStory} />
                <div className={`relative p-[2px] rounded-full ${myStories ? 'bg-gradient-to-tr from-yellow-400 to-fuchsia-600' : 'bg-gray-300'}`}>
                    <div className="bg-white p-[2px] rounded-full">
                        <Avatar className="w-14 h-14 border border-gray-200">
                            <AvatarImage src={user?.profilePicture} alt={user?.username} />
                            <AvatarFallback>{user?.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                    </div>
                    {!myStories && (
                        <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full text-white text-xs w-5 h-5 flex items-center justify-center border-2 border-white">+</div>
                    )}
                </div>
                <span className="text-xs text-center truncate w-16 text-gray-700">Your story</span>
            </div>

            {/* Other users */}
            {otherUsers.map(authorId => {
                const authorStories = groupedStories[authorId];
                const author = authorStories[0].author;
                const allViewed = authorStories.every(s => s.views.includes(user?._id));

                return (
                    <div key={authorId} className="flex flex-col items-center gap-1 cursor-pointer min-w-[70px]" onClick={() => handleViewStory(authorStories[0])}>
                        <div className={`p-[2px] rounded-full ${allViewed ? 'bg-gray-300' : 'bg-gradient-to-tr from-yellow-400 to-fuchsia-600'}`}>
                            <div className="bg-white p-[2px] rounded-full">
                                <Avatar className="w-14 h-14 border border-gray-200">
                                    <AvatarImage src={author.profilePicture} alt={author.username} />
                                    <AvatarFallback>{author.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                            </div>
                        </div>
                        <span className="text-xs text-center truncate w-16 text-gray-700">{author.username}</span>
                    </div>
                )
            })}

            {/* Story Viewer Dialog */}
            <Dialog open={!!viewingStory} onOpenChange={(open) => !open && setViewingStory(null)}>
                <DialogContent className="max-w-md p-0 h-[80vh] bg-black border-none overflow-hidden flex flex-col justify-center outline-none">
                    {viewingStory && (
                        <div className="relative w-full h-full flex items-center justify-center">
                            {viewingStory.media.match(/\.(mp4|webm|ogg)$/i) ? (
                                <video src={viewingStory.media} autoPlay controls className="max-w-full max-h-full object-contain" />
                            ) : (
                                <img src={viewingStory.media} alt="Story" className="max-w-full max-h-full object-contain" />
                            )}
                            <div className="absolute top-4 left-4 flex items-center gap-2 z-10 bg-black/30 p-2 rounded-full">
                                <Avatar className="w-8 h-8 border border-white">
                                    <AvatarImage src={viewingStory.author.profilePicture} />
                                </Avatar>
                                <span className="text-white font-semibold text-sm drop-shadow-md">{viewingStory.author.username}</span>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default StoriesBar;
