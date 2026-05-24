import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import useGetRTM from '@/hooks/useGetRTM';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';

const VideoPlayer = ({ src, roomId }) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const { user } = useSelector(store => store.auth);
    const socketRef = useRef(null);

    useEffect(() => {
        if (!user || !roomId) return;
        
        socketRef.current = io('http://localhost:8000', {
            query: { userId: user?._id }
        });

        const socket = socketRef.current;
        socket.emit('joinChat', roomId); // Reusing room logic for watch party

        socket.on('videoAction', ({ action, time, senderId }) => {
            if (senderId === user?._id) return;
            
            if (videoRef.current) {
                if (Math.abs(videoRef.current.currentTime - time) > 1) {
                    videoRef.current.currentTime = time;
                }
                if (action === 'play') {
                    videoRef.current.play().catch(e => console.log(e));
                    setIsPlaying(true);
                } else if (action === 'pause') {
                    videoRef.current.pause();
                    setIsPlaying(false);
                }
            }
        });

        return () => {
            socket.emit('leaveChat', roomId);
            socket.disconnect();
        };
    }, [user, roomId]);

    const togglePlay = () => {
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
            socketRef.current?.emit('videoAction', { action: 'play', time: videoRef.current.currentTime, senderId: user?._id, roomId });
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
            socketRef.current?.emit('videoAction', { action: 'pause', time: videoRef.current.currentTime, senderId: user?._id, roomId });
        }
    };

    const toggleMute = () => {
        videoRef.current.muted = !videoRef.current.muted;
        setIsMuted(videoRef.current.muted);
    };

    return (
        <div className="relative group rounded-lg overflow-hidden bg-black flex justify-center items-center">
            <video 
                ref={videoRef}
                src={src} 
                className="w-full max-h-[80vh] object-contain"
                loop
                muted={isMuted}
                onClick={togglePlay}
            />
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={togglePlay} className="text-white bg-black/50 p-2 rounded-full hover:bg-black/80">
                    {isPlaying ? <Pause size={20}/> : <Play size={20}/>}
                </button>
                <button onClick={toggleMute} className="text-white bg-black/50 p-2 rounded-full hover:bg-black/80">
                    {isMuted ? <VolumeX size={20}/> : <Volume2 size={20}/>}
                </button>
            </div>
        </div>
    );
};

export default VideoPlayer;
