import { setMessages } from "@/redux/chatSlice";
import axios from "axios";
import React, {useEffect} from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetAllMessage = () => {
    const dispatch = useDispatch();
    const {selectedUser} = useSelector(store=>store.auth);

    useEffect(() => {
        const fetchAllMessage = async () => {
            try {
                if(!selectedUser?._id) return;
                const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/message/all/${selectedUser._id}`, {withCredentials:true});
                if (res.data.success) {
                    dispatch(setMessages(res.data.messages));
                }
            } catch (error) {
                console.log(error);
            }
        }

        fetchAllMessage();
    }, [selectedUser]);
};

export default useGetAllMessage;