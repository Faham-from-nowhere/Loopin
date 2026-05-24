
import Feed from "./Feed";
import { Outlet } from "react-router-dom";
import RightSidebar from "./RightSidebar";
import useGetAllPost from "@/hooks/useGetAllPost";
import useGetSuggestedUsers from "@/hooks/useGetSuggestedUsers";
import { useState } from "react";
import { useSelector } from "react-redux";

const Home = () => {
    const [feedType, setFeedType] = useState('latest');
    const { user } = useSelector(store => store.auth);
    useGetAllPost(feedType);
    useGetSuggestedUsers();

    return (
        <div className='flex justify-center'>
            <div className= 'flex-grow w-full md:w-[60%] lg:w-[50%] px-2 md:px-4 overflow-y-auto min-h-screen pb-16 md:pb-0'>
                <div className="flex justify-center gap-4 mb-4 border-b border-gray-200 pb-2 mt-4">
                    <button 
                        onClick={() => setFeedType('latest')} 
                        className={`font-semibold pb-1 ${feedType === 'latest' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-gray-600'}`}>
                        Latest
                    </button>
                    <button 
                        onClick={() => setFeedType('smart')} 
                        className={`font-semibold pb-1 ${feedType === 'smart' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-gray-600'}`}>
                        For You ✨
                    </button>
                </div>

                <Feed />
                <Outlet />
            </div>
            <RightSidebar />
        </div>
    )
}

export default Home