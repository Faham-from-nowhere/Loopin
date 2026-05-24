import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Bookmark, MessageCircle, MoreHorizontal, Send } from "lucide-react";
import { Button } from "./ui/button";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentDialog from "./CommentDialog";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import axios from "axios";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { Badge } from "./ui/badge";
import { useMentionSearch } from "@/hooks/useMentionSearch";
import MentionDropdown from "./MentionDropdown";

const Post = ({post}) => {
    const [text, setText] = useState("");
    const [open, setOpen] = useState(false);
    const {user} = useSelector(store=>store.auth);
    const {posts} = useSelector(store=>store.post);
    const [liked, setLiked] = useState((post.likes?.includes(user?._id)) || false);
    const [postLike, setPostLike] = useState(post.likes?.length || 0);
    const [comment, setComment] = useState(post.comments);
    const dispatch = useDispatch();
    const { suggestedUsers, isMentioning, handleSelect } = useMentionSearch(text);
    
    const changeEventHandler = (e) => {
        const inputText = e.target.value;
        if(inputText.trim()){
        setText(inputText);
        }else{
            setText("");
        }
    }

    const LikeOrDislikeHandler = async() => {
        try {
            const action = liked ? 'dislike' : 'like';
            const res = await axios.post(`\${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/post/${post._id}/${action}`, {}, { withCredentials:true });
            if(res.data.success){
                const updatedLikes = liked ? postLike - 1 : postLike + 1;
                setPostLike(updatedLikes);
                setLiked(!liked);
                const updatedPostData = posts.map(p=>
                    p._id === post._id ? {
                        ...p,
                        likes:liked ? p.likes.filter(id => id !== user._id) : [...p.likes, user._id]
                    } : p // so if already liked, filter out the liked user id i.e remove it from array and if not keep all other post params same and only add user id
                );
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            
        }
    }

    const commentHandler = async () => {
        try {
           const res = await axios.post(`\${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/post/${post._id}/comment`, {text}, {
            headers: {
                'Content-Type':'application/json'
            } , withCredentials:true}); 
            if(res.data.success){
                const updatedCommentData = [...comment, res.data.comment];
                setComment(updatedCommentData);
                const updatedPostData = posts.map(p=>
                    p._id===post._id ? {...p, comments:updatedCommentData} : p
                );
                dispatch(setPosts(updatedPostData));
                setText("");
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const deletePostHandler = async () => {
        try {
            const res = await axios.delete(`\${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/post/${post._id}/delete`, {withCredentials:true});
            if(res.data.success){
                const updatedPostData = posts.filter((postItem) => postItem._id !== post?._id);
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || 'Error deleting post');
        }
    }

    const archivePostHandler = async () => {
        try {
            const res = await axios.put(`\${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/post/${post._id}/archive`, {}, {withCredentials:true});
            if(res.data.success){
                // We should remove the post from the current view by updating Redux
                // If the user is on their profile "Archive" tab, they need to refresh, or we handle it via Redux state
                // Since this is a simple implementation, let's just remove it from `posts` state so it disappears from feed
                const updatedPostData = posts.filter((postItem) => postItem._id !== post?._id);
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || 'Error archiving post');
        }
    }

    const bookmarkHandler = async () => {
        try {
            const res = await axios.get(`\${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/post/${post._id}/bookmark`, {withCredentials:true});
            if(res.data.success){
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className='my-8 w-full max-w-sm mx-auto'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                    <Avatar>
                        <AvatarImage src={post.author?.profilePicture} alt="post_image" />
                        <AvatarFallback>MF</AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-3">
                        <h1>{post.author?.username}</h1>
                       {user?._id === post?.author?._id && <Badge variant="secondary" className="bg-gray-900/20 dark:bg-gray-100/100">Author</Badge>}
                    </div>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <MoreHorizontal className='cursor-pointer' />
                    </DialogTrigger>
                    <DialogContent className='flex flex-col items-center text-sm text-center'>
                        {
                            post?.author?._id !== user?._id && <Button variant='ghost' className='cursor-pointer w-fit text-[#ED4956] font-bold'>Unfollow</Button>
                        }
                        <Button variant="ghost" className='cursor-pointer w-fit'>Add to favourites</Button>
                        {
                            user && user?._id === post?.author._id && (
                                <>
                                    <Button onClick={archivePostHandler} variant="ghost" className='cursor-pointer w-fit'>{post.isArchived ? 'Unarchive' : 'Archive'}</Button>
                                    <Button onClick={deletePostHandler} variant="ghost" className='cursor-pointer w-fit text-red-500'>Delete</Button>
                                </>
                            )
                        }
                        
                    </DialogContent>
                </Dialog>
            </div>
            <div className="relative">
                {post.image?.endsWith('.mp4') || post.image?.includes('/video/upload/') ? (
                    <div className="relative w-full">
                        <video className='rounded-sm my-2 w-full max-h-[600px] object-contain' src={post.image} controls />
                        <div className="absolute top-4 left-4 flex gap-2">
                            <Badge className="bg-black/60 hover:bg-black/80 text-white border-none shadow-md">🎥 Reel</Badge>
                            {Math.random() > 0.5 && <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none shadow-md">🤝 Collaboration</Badge>}
                        </div>
                    </div>
                ) : (
                    <img className='rounded-sm my-2 w-full max-h-[600px] object-contain bg-gray-100' src={post.image} alt="post_img" />
                )}
            </div>
            <div className="flex items-center justify-between my-2">
                <div className="flex items-center gap-3">
                    {
                        liked ? <FaHeart onClick={LikeOrDislikeHandler} size={'24'} className="cursor-pointer text-red-600" /> : <FaRegHeart onClick={LikeOrDislikeHandler} size={'22px'} className='cursor-pointer hover:text-gray-600' />
                    }
                    
                    <MessageCircle onClick={()=>{dispatch(setSelectedPost(post));
                         setOpen(true);
                         }} className='cursor-pointer hover:text-gray-600' />
                    <Send className='cursor-pointer hover:text-gray-600' />
                </div>
                <Bookmark onClick={bookmarkHandler} className='cursor-pointer hover:text-gray-600' />
            </div>
            <span className="font-medium mb-2 font-medium">{postLike} likes</span>
            <p>
                <span className="font-medium mr-2">{post.author?.username}</span>
                {post.caption}
            </p>
            {
                comment.length > 0 && (
                    <span onClick={()=>{dispatch(setSelectedPost(post));
                         setOpen(true);
                         }} className="cursor-pointer text-sm text-gray-400">View all comments</span>
                )
            }
            <CommentDialog open={open} setOpen={setOpen}/>
            <div className="relative flex items-center justify-between">
                {isMentioning && (
                    <MentionDropdown 
                        users={suggestedUsers} 
                        onSelect={(username) => handleSelect(username, setText)} 
                        position="top" 
                    />
                )}
                <input type="text" value={text} onChange={changeEventHandler} placeholder="Add a comment..." className="outline-none text-sm w-full" />
                {text && <span onClick={commentHandler} className="text-[#3BADF8] cursor-pointer">Post</span>}
            </div>
        </div>
    )
}

export default Post
