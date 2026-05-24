import { useState, useEffect } from 'react';
import axios from 'axios';

export const useMentionSearch = (text) => {
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [isMentioning, setIsMentioning] = useState(false);

    useEffect(() => {
        // Match if the last word starts with @
        const match = text.match(/@([a-zA-Z0-9_]*)$/);
        
        if (match) {
            setIsMentioning(true);
            const query = match[1];
            
            if (query.length > 0) {
                // Fetch users
                const fetchUsers = async () => {
                    try {
                        const res = await axios.get(`http://localhost:8000/api/v1/user/search?query=${query}`, { withCredentials: true });
                        if (res.data.success) {
                            setSuggestedUsers(res.data.users);
                        }
                    } catch (error) {
                        console.log(error);
                    }
                };
                // Simple debounce
                const timer = setTimeout(fetchUsers, 300);
                return () => clearTimeout(timer);
            } else {
                setSuggestedUsers([]); // Clear if just '@' with no text
            }
        } else {
            setIsMentioning(false);
            setSuggestedUsers([]);
        }
    }, [text]);

    const handleSelect = (username, setText) => {
        const newText = text.replace(/@([a-zA-Z0-9_]*)$/, `@${username} `);
        setText(newText);
        setIsMentioning(false);
        setSuggestedUsers([]);
    };

    return { suggestedUsers, isMentioning, handleSelect };
};
