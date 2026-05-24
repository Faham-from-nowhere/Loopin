import { setLikeNotification } from "@/redux/rtmSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetNotifications = () => {
    const dispatch = useDispatch();
    const { user } = useSelector(store => store.auth);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user) return;
            try {
                const res = await axios.get('http://localhost:8000/api/v1/notification', { withCredentials: true });
                if (res.data.success) {
                    dispatch(setLikeNotification(res.data.notifications));
                }
            } catch (error) {
                console.log(error);
            }
        };

        fetchNotifications();
    }, [user, dispatch]);
};

export default useGetNotifications;
