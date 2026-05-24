import { Edit, Loader2 } from "lucide-react";
import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { setAuthUser } from "@/redux/authSlice";
import { toast } from "sonner";

const EditProfile = () => { // Need to implement story in here
    const imageRef = useRef();
    const {user} = useSelector(store=>store.auth);
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState({
        profilePhoto:user?.profilePicture,
        bio:user?.bio,
        gender:user?.gender,
        isPrivate:user?.isPrivate || false
    });
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const togglePrivacyHandler = async () => {
        try {
            const res = await axios.post('http://localhost:8000/api/v1/user/toggle-privacy', {}, { withCredentials: true });
            if (res.data.success) {
                setInput({ ...input, isPrivate: res.data.isPrivate });
                const updatedUserData = { ...user, isPrivate: res.data.isPrivate };
                dispatch(setAuthUser(updatedUserData));
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to toggle privacy');
        }
    };

    const fileChangeHandler = (e) => {
        const file = e.target.files?.[0];
        if(file){
            setInput({...input, profilePhoto:file}); //bio and gender will be same in input only pfp changes
        }
    }

    const selectChangeHandler = (value) => {
        setInput({...input, gender:value});
    }

    const editProfileHandler = async() => {
        setLoading(true);
        const formData = new FormData();
        if (input.bio !== undefined && input.bio !== null) formData.append("bio", input.bio);
        if (input.gender !== undefined && input.gender !== null) formData.append("gender", input.gender);
        if(input.profilePhoto){
            formData.append("profilePhoto", input.profilePhoto);
        }
        try {
            const res = await axios.post('http://localhost:8000/api/v1/user/profile/edit', formData, {
                headers:{
                    'Content-Type':'multipart/form-data'
                },
                withCredentials:true
            });
            if(res.data.success){
                const updatedUserData = {
                    ...user,
                    bio:res.data.user.bio,
                    profilePicture:res.data.user?.profilePicture,
                    gender:res.data.user.gender
                };
                dispatch(setAuthUser(updatedUserData));
                navigate(`/profile/${user?._id}`);
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="flex max-w-2xl mx-auto pl-10">
            <section className="flex flex-col gap-6 w-full my-8">
                <h1 className="font-bold text-xl">Edit Profile</h1>
                <div className='flex items-center justify-between bg-gray-100 rounded-xl p-4'>
                    <div className="flex items-center gap-3">
                         <Avatar>
                            <AvatarImage src={user?.profilePicture} alt="post_image" />
                            <AvatarFallback>MF</AvatarFallback>
                        </Avatar>
                    <div>
                        <h1 className="text-sm font-bold">{user?.username}</h1>
                        <span className="text-gray-600">{user?.bio || 'Bio here...'}</span>
                    </div>
                    </div>
                    <input ref={imageRef} onChange={fileChangeHandler} type="file" className="hidden"/>
                    <Button onClick={()=> imageRef?.current.click()} className="bg-[#0095F6] h-8 hover:bg-[#318bc7]" >Change photo</Button>
                </div>
                <div>
                    <h1 className="font-bold text-xl mb-2">Bio</h1>
                    <Textarea value={input.bio} onChange={(e)=> setInput({...input, bio:e.target.value})} name='bio' className="focus-visible:ring-transparent"/>
                </div>
                <div>
                    <h1 className="font-bold mb-2">Gender</h1>
                    <Select defaultValue={input.gender} onValueChange={selectChangeHandler}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center justify-between border border-gray-200 p-4 rounded-md">
                    <div>
                        <h1 className="font-bold text-lg">Private Account</h1>
                        <p className="text-sm text-gray-500">When your account is private, only people you approve can see your photos and videos on Instagram. Your existing followers won't be affected.</p>
                    </div>
                    <Button 
                        onClick={togglePrivacyHandler}
                        variant={input.isPrivate ? "default" : "outline"}
                        className={input.isPrivate ? "bg-black text-white" : ""}
                    >
                        {input.isPrivate ? "Private" : "Public"}
                    </Button>
                </div>
                <div className="flex justify-end">
                    {
                        loading ? (
                            <Button className="w-fit bg-[#0095F6] hover:bg-[#2a8ccd]"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Please Wait</Button>
                        ) : (
                            <Button onClick={editProfileHandler} className="w-fit bg-[#0095F6] hover:bg-[#2a8ccd]">Submit</Button>
                        )
                    }
                </div>
            </section>

        </div>
    )
}

export default EditProfile