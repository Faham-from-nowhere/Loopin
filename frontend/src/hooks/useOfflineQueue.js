import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

export const useOfflineQueue = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [queue, setQueue] = useState([]);

    // Load initial queue from localStorage
    useEffect(() => {
        const savedQueue = localStorage.getItem('offlinePostQueue');
        if (savedQueue) {
            setQueue(JSON.parse(savedQueue));
        }

        const handleOnline = () => {
            setIsOnline(true);
            toast.success("Back online! Syncing offline posts...");
        };
        const handleOffline = () => {
            setIsOnline(false);
            toast.warning("You are offline. Posts will be queued.");
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Sync queue when coming back online
    useEffect(() => {
        if (isOnline && queue.length > 0) {
            syncQueue();
        }
    }, [isOnline]);

    const addToQueue = (postData) => {
        const newQueue = [...queue, postData];
        setQueue(newQueue);
        localStorage.setItem('offlinePostQueue', JSON.stringify(newQueue));
        toast.success("Post saved to offline queue!");
    };

    const syncQueue = async () => {
        let remainingQueue = [...queue];
        
        for (let i = 0; i < queue.length; i++) {
            const post = queue[i];
            try {
                // Convert base64 back to file for FormData
                const formData = new FormData();
                formData.append('caption', post.caption);
                
                if (post.image) {
                    const res = await fetch(post.image);
                    const blob = await res.blob();
                    formData.append('image', blob, 'offline_upload.jpg');
                }

                await axios.post('http://localhost:8000/api/v1/post/addpost', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    withCredentials: true
                });

                // Remove successfully synced post from queue
                remainingQueue = remainingQueue.filter((_, index) => index !== 0);
            } catch (error) {
                console.error("Failed to sync offline post", error);
                // Stop syncing on first error to preserve order
                break;
            }
        }

        setQueue(remainingQueue);
        localStorage.setItem('offlinePostQueue', JSON.stringify(remainingQueue));
        if (remainingQueue.length === 0 && queue.length > 0) {
            toast.success("All offline posts synced successfully!");
        }
    };

    return { isOnline, queue, addToQueue };
};
