import { createSlice } from "@reduxjs/toolkit";

const rtmSlice = createSlice({
    name:'realTimeNotification',
    initialState:{
        likeNotification:[],
    },
    reducers:{
        setLikeNotification:(state, action) => {
            const notification = action.payload;
            if (Array.isArray(notification)) {
                state.likeNotification = notification;
            } else if(notification?.type === 'dislike'){
                state.likeNotification = state.likeNotification.filter((item)=>item.userId !== notification.userId); //Get array with all except disliked user
            } else if (notification) {
                // Handle 'like', 'comment', 'message', 'follow' generically
                state.likeNotification.push(notification);
            }
        }
    }
});

export const {setLikeNotification} = rtmSlice.actions;
export default rtmSlice.reducer;