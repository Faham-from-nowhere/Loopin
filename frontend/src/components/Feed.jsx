
import Posts from "./Posts";
import StoriesBar from "./StoriesBar";

const Feed = () => {
    return (
        <div className='flex-1 my-8 flex flex-col items-center pl-0 md:pl-[20%]'>
            <StoriesBar />
            <Posts />  
        </div>
    )
}

export default Feed