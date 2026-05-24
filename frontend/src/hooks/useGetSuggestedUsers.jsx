import { setSuggestedUsers } from "@/redux/authSlice";
import { combineSlices } from "@reduxjs/toolkit";
import axios from "axios";
import React, {useEffect} from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetSuggestedUsers = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchSuggestedUsers = async () => {
            try {
                const res = await axios.get(`\${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/user/suggested`, {withCredentials:true});
                if (res.data.success) {
                    console.log(res.data.posts);
                    dispatch(setSuggestedUsers(res.data.users));
                }
            } catch (error) {
                console.log(error);
            }
        }

        fetchSuggestedUsers();
    }, []);
};

export default useGetSuggestedUsers;