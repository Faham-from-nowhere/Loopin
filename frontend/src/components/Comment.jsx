import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useSelector, useDispatch } from "react-redux";
import { MoreHorizontal } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import axios from "axios";
import { toast } from "sonner";
import { setPosts, setSelectedPost } from "@/redux/postSlice";

const Comment = ({ comment }) => {
    const { user } = useSelector(store => store.auth);
    const { posts, selectedPost } = useSelector(store => store.post);
    const dispatch = useDispatch();
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment?.text);

    const isAuthor = user?._id === comment?.author?._id;
    // We need the post ID this comment belongs to. We can infer it from selectedPost since comments are only shown in CommentDialog for selectedPost.
    // Or if shown in feed, we need to pass postId. But currently Comment is only used in CommentDialog.
    const postId = selectedPost?._id || comment?.post;

    const handleDelete = async () => {
        try {
            const res = await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/post/comment/${comment._id}`, { withCredentials: true });
            if (res.data.success) {
                if (postId) {
                    const updatedPosts = posts.map(p => {
                        if (p._id === postId) {
                            return { ...p, comments: p.comments.filter(c => c._id !== comment._id) };
                        }
                        return p;
                    });
                    dispatch(setPosts(updatedPosts));
                    if (selectedPost && selectedPost._id === postId) {
                        dispatch(setSelectedPost({ ...selectedPost, comments: selectedPost.comments.filter(c => c._id !== comment._id) }));
                    }
                }
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete comment');
        }
    };

    const handleEdit = async () => {
        if (!editText.trim()) return;
        try {
            const res = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/post/comment/${comment._id}`, { text: editText }, { withCredentials: true });
            if (res.data.success) {
                if (postId) {
                    const updatedPosts = posts.map(p => {
                        if (p._id === postId) {
                            return {
                                ...p,
                                comments: p.comments.map(c => c._id === comment._id ? { ...c, text: editText } : c)
                            };
                        }
                        return p;
                    });
                    dispatch(setPosts(updatedPosts));
                    if (selectedPost && selectedPost._id === postId) {
                        dispatch(setSelectedPost({ ...selectedPost, comments: selectedPost.comments.map(c => c._id === comment._id ? { ...c, text: editText } : c) }));
                    }
                }
                setIsEditing(false);
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to edit comment');
        }
    };

    return (
        <div className="my-2 flex items-start justify-between">
            <div className="flex gap-3 items-center w-full">
                <Avatar>
                    <AvatarImage src={comment?.author?.profilePicture} />
                    <AvatarFallback>MF</AvatarFallback>
                </Avatar>
                {isEditing ? (
                    <div className="flex gap-2 w-full items-center">
                        <input 
                            type="text" 
                            className="w-full text-sm outline-none border-b border-gray-300 focus:border-black bg-transparent" 
                            value={editText} 
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => { if(e.key === 'Enter') handleEdit(); }}
                            autoFocus
                        />
                        <button onClick={handleEdit} className="text-blue-500 text-sm font-semibold">Save</button>
                        <button onClick={() => { setIsEditing(false); setEditText(comment?.text); }} className="text-gray-500 text-sm font-semibold">Cancel</button>
                    </div>
                ) : (
                    <h1 className="font-bold text-sm break-all">{comment?.author?.username} <span className="font-normal p-1">{comment?.text}</span></h1>
                )}
            </div>
            
            {isAuthor && !isEditing && (
                <Popover>
                    <PopoverTrigger asChild>
                        <MoreHorizontal className="cursor-pointer w-5 h-5 text-gray-500 hover:text-black ml-2 flex-shrink-0" />
                    </PopoverTrigger>
                    <PopoverContent className="w-32 p-0 flex flex-col">
                        <Button variant="ghost" className="w-full justify-start rounded-none" onClick={() => setIsEditing(true)}>Edit</Button>
                        <Button variant="ghost" className="w-full justify-start rounded-none text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleDelete}>Delete</Button>
                    </PopoverContent>
                </Popover>
            )}
        </div>
    )
}

export default Comment;