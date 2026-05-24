import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader } from './ui/dialog';
import { Input } from './ui/input';
import axios from 'axios';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Link } from 'react-router-dom';

const SearchDialog = ({ open, setOpen }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        const value = e.target.value;
        setQuery(value);
        if(!value.trim()){
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const res = await axios.get(`\${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/user/search?query=${value}`, {withCredentials: true});
            if(res.data.success){
                setResults(res.data.users);
            }
        } catch (error) {
            console.log(error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]" onInteractOutside={() => setOpen(false)}>
                <DialogHeader className="font-semibold text-lg">Search Users</DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                    <Input 
                        placeholder="Search by username..." 
                        value={query}
                        onChange={handleSearch}
                        className="focus-visible:ring-transparent"
                    />
                    <div className="min-h-[200px] max-h-[400px] overflow-y-auto flex flex-col gap-2">
                        {loading ? (
                            <p className="text-center text-gray-500 mt-4">Searching...</p>
                        ) : results.length > 0 ? (
                            results.map(user => (
                                <Link 
                                    to={`/profile/${user._id}`} 
                                    key={user._id} 
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                    <Avatar>
                                        <AvatarImage src={user.profilePicture} />
                                        <AvatarFallback>{user.username?.slice(0,2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium text-sm">{user.username}</span>
                                </Link>
                            ))
                        ) : query.trim() ? (
                            <p className="text-center text-gray-500 mt-4">No users found.</p>
                        ) : (
                            <p className="text-center text-gray-500 mt-4">Type a username to start searching.</p>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SearchDialog;
