import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const MentionDropdown = ({ users, onSelect, position }) => {
    if (!users || users.length === 0) return null;

    return (
        <div 
            className="absolute z-50 bg-white border border-gray-200 shadow-lg rounded-md overflow-hidden max-h-48 overflow-y-auto"
            style={{ bottom: position === 'top' ? '100%' : 'auto', top: position === 'bottom' ? '100%' : 'auto', left: 0, width: '100%', marginBottom: position === 'top' ? '8px' : 0, marginTop: position === 'bottom' ? '8px' : 0 }}
        >
            {users.map(user => (
                <div 
                    key={user._id} 
                    className="flex items-center gap-3 p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => onSelect(user.username)}
                >
                    <Avatar className="w-8 h-8">
                        <AvatarImage src={user.profilePicture} />
                        <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">{user.username}</span>
                </div>
            ))}
        </div>
    );
};

export default MentionDropdown;
