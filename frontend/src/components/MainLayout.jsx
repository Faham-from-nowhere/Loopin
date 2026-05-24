
import { Outlet } from "react-router-dom";
import LeftSidebar from "./LeftSidebar";
import useGetNotifications from "@/hooks/useGetNotifications";

const MainLayout = () => {
    useGetNotifications();
    return (
        <div className="pb-16 md:pb-0 md:pl-[16%]">
            <LeftSidebar />
            <div className="w-full">
                <Outlet />
            </div>
        </div>
    )
}

export default MainLayout