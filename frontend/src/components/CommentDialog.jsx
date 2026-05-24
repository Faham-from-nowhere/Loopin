
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { useDispatch, useSelector } from "react-redux";
import Comment from "./Comment.jsx";
import axios from "axios";
import { toast } from "sonner";
import { setPosts } from "@/redux/postSlice";
import { useMentionSearch } from '@/hooks/useMentionSearch';
import MentionDropdown from './MentionDropdown';

const CommentDialog = ({ open, setOpen }) => {
    const [text, setText] = useState("");
    const {selectedPost, posts} = useSelector(store=>store.post);
    const [comment, setComment] = useState([]);
    const dispatch = useDispatch();
    const { suggestedUsers, isMentioning, handleSelect } = useMentionSearch(text);
    useEffect(() => {
        if(selectedPost){
            setComment(selectedPost.comments);
        }
    }, [selectedPost]); //Always runs first
    const changEventHandler = (e) => {
        const inputText = e.target.value;
        if(inputText.trim()){
            setText(inputText);
        }else{
            setText("");
        }
    }


const sendMessageHandler = async () => {
        try {
           const res = await axios.post(`\${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/post/${selectedPost._id}/comment`, {text}, {
            headers: {
                'Content-Type':'application/json'
            } , withCredentials:true}); 
            if(res.data.success){
                const updatedCommentData = [...comment, res.data.comment];
                setComment(updatedCommentData);
                const updatedPostData = posts.map(p=>
                    p._id===selectedPost._id ? {...p, comments:updatedCommentData} : p
                );
                dispatch(setPosts(updatedPostData));
                setText("");
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <Dialog open={open}>
            <DialogContent onInteractOutside={() => setOpen(false)} className="sm:max-w-5xl h-[80vh] p-0 flex flex-col">
                <div className="flex flex-1">
                    <div className="w-1/2">
                        <img src={selectedPost?.image}
                            alt="post_img"
                            className="w-full h-full rounded-l-lg object-cover" />
                    </div>
                    <div className="w-1/2 h-full flex flex-col justify-between">
                        <div className="flex items-center justify-between p-4">
                            <div className="flex gap-3 items-center">
                                <Link to={`/profile/${selectedPost?.author?._id}`}>
                                    <Avatar>
                                        <AvatarImage src={selectedPost?.author?.profilePicture} />
                                        <AvatarFallback>MF</AvatarFallback>
                                    </Avatar>
                                </Link>
                                <div>
                                    <Link to={`/profile/${selectedPost?.author?._id}`} className="font-semibold text-xs">{selectedPost?.author?.username}</Link>
                                    {/*<span className="text-gray-600 text-sm">Bio here...</span>*/}
                                </div>
                            </div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <MoreHorizontal className="cursor-pointer" />
                                </DialogTrigger>
                                <DialogContent className="flex flex-col items-center text-sm text-center">
                                    <div className="cursor-pointer w-full text-[#ED4956] font-bold">
                                        Unfollow
                                    </div>
                                    <div className="cursor-pointer w-full">
                                        Add to Favorites
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <hr />
                        <div className="flex-1 overflow-y-auto max-h-96 p-4">
                            {
                                comment.map((comment)=> <Comment key={comment._id} comment={comment}/>)
                            }
                        </div>
                        <div className="p-4 relative">
                            {isMentioning && (
                                <MentionDropdown 
                                    users={suggestedUsers} 
                                    onSelect={(username) => handleSelect(username, setText)} 
                                    position="top" 
                                />
                            )}
                            <div className="flex items-center gap-2">
                                <input type="text" value={text} onChange={changEventHandler} placeholder="Add a comment..." className="w-full outline-none border text-sm border-gray-300 p-2 rounded"/>
                                <Button disabled={!text.trim()} onClick={sendMessageHandler} variant="outline">Send</Button> 
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default CommentDialog
