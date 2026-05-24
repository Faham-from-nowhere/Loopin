import { setPosts } from "@/redux/postSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetAllPost = (feedType = 'latest') => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchAllPost = async () => {
            try {
                const endpoint = feedType === 'smart' 
                    ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/post/smart` 
                    : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/post/all`;
                const res = await axios.get(endpoint, {withCredentials:true});
                if (res.data.success) {
                    dispatch(setPosts(res.data.posts));
                }
            } catch (error) {
                console.log(error);
            }
        }

        fetchAllPost();
    }, [feedType, dispatch]);
};

export default useGetAllPost;