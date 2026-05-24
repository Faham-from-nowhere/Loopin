import axios from "axios";
import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { readFileAsDataURL } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "@/redux/postSlice";
import { compressVideo } from "@/lib/videoCompression";
import { useOfflineQueue } from "@/hooks/useOfflineQueue";
import { useMentionSearch } from '@/hooks/useMentionSearch';
import MentionDropdown from './MentionDropdown';

const CreatePost = ({open,setOpen}) => {
    const imageRef = useRef();
    const [file, setFile] = useState("");
    const [caption, setCaption] = useState("");
    const [imagePreview, setImagePreview] = useState("");
    const [fileType, setFileType] = useState("");
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [useAiCaption, setUseAiCaption] = useState(false);
    const {user} = useSelector(store=>store.auth);
    const {posts} = useSelector(store=>store.post);
    const dispatch = useDispatch();
    const { isOnline, addToQueue } = useOfflineQueue();
    const { suggestedUsers, isMentioning, handleSelect } = useMentionSearch(caption);

    const fileChangeHandler = async(e) => {
        const file = e.target.files?.[0];
        if(file){
            setFile(file);
            setFileType(file.type);
            
            // For large files, object URL is much better than base64 data URL
            const url = URL.createObjectURL(file);
            setImagePreview(url);
        }
    }
    const createPostHandler = async() => {
        try {
            if (!isOnline) {
                if (file.type.startsWith('video/')) {
                    toast.error("Offline video uploads are not supported. Please connect to the internet.");
                    return;
                }
                const base64Image = await readFileAsDataURL(file);
                addToQueue({ caption, image: base64Image, useAiCaption });
                setOpen(false);
                setCaption("");
                setImagePreview("");
                return;
            }

            setLoading(true);
            const formData = new FormData();
            formData.append("caption", caption);
            if (useAiCaption) {
                formData.append("useAiCaption", "true");
            }
            
            if (imagePreview) {
                let uploadFile = file;
                if (file.type.startsWith('video/')) {
                    toast.info("Compressing video... this may take a moment.");
                    // Compress video
                    uploadFile = await compressVideo(file, (p) => setProgress(p));
                    toast.success("Video compression complete!");
                }
                formData.append("image", uploadFile);
            }
            const res = await axios.post(`\${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/post/addpost`, formData, {
                headers:{
                    'Content-Type':'multipart/form-data'
                },
                withCredentials:true
            });
            if(res.data.success) {
                dispatch(setPosts([res.data.post, ...posts])); //spade operator keeps earlier posts but add new ones to list as soon as they are available
                toast.success(res.data.message);
                setOpen(false);
            }
        } catch (error) {
           console.error("Post Creation Error:", error);
           toast.error(error.message || error.response?.data?.message || "Error creating post"); 
        } finally {
            setLoading(false);
            setProgress(0);
        }
    }
    return (
        <Dialog open={open}>
            <DialogContent aria-describedby={undefined} onInteractOutside={()=> setOpen(false)}>
                <DialogHeader>
                    <DialogTitle className="text-center font-semibold">Create New Post</DialogTitle>
                </DialogHeader>
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={user?.profilePicture} alt="img"/>
                        <AvatarFallback>MF</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="font-semibold text-xs">{user?.username}</h1>
                        <span className="text-gray-600 text-xs">Bio Here...</span>
                    </div>
                </div>
                <div className="relative">
                    {isMentioning && (
                        <MentionDropdown 
                            users={suggestedUsers} 
                            onSelect={(username) => handleSelect(username, setCaption)} 
                            position="bottom" 
                        />
                    )}
                    <Textarea value={caption} onChange={(e)=> setCaption(e.target.value)} className="focus-visible:ring-transparent border-none" placeholder="Let your thoughts flow"/>
                </div>
                <div className="flex items-center gap-2 px-2">
                    <input 
                        type="checkbox" 
                        id="ai-caption" 
                        checked={useAiCaption}
                        onChange={(e) => setUseAiCaption(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="ai-caption" className="text-sm font-medium text-gray-700 cursor-pointer">
                        ✨ Enhance caption with AI
                    </label>
                </div>

                {imagePreview && (
                    <div className="w-full h-64 flex items-center justify-center">
                        {fileType.startsWith('video/') ? (
                            <video src={imagePreview} controls className="object-cover h-full w-full rounded-md"/>
                        ) : (
                            <img src={imagePreview} alt="preview_img" className="object-cover h-full w-full rounded-md"/>
                        )}
                    </div>
                )}
                <input ref={imageRef} type="file" className="hidden" onChange={fileChangeHandler}/>
                <Button onClick={()=> imageRef.current.click()} className="w-fit mx-auto bg-[#0095F6] hover:bg-[#258BCF]">Upload from device</Button>
                {
                    imagePreview && (
                        loading ? (
                            <Button disabled>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {progress > 0 ? `Compressing (${progress}%)` : 'Please Wait..'}
                            </Button>
                        ) : (
                            <Button onClick={createPostHandler} type="submit" className="bg-black text-white w-full">Post</Button>
                        )
                    )
                    
                }
            </DialogContent>
        </Dialog>
    )
}

export default CreatePost 
