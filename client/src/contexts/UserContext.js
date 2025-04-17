import React, { createContext, useContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userName, setUserName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [hasVoted, setHasVoted] = useState(false);

    return (
        <UserContext.Provider value={{ 
            userName, 
            setUserName, 
            roomCode,
            setRoomCode,
            hasVoted, 
            setHasVoted 
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    return useContext(UserContext);
};