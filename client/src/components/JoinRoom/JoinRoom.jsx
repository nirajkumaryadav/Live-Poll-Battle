import React, { useState, useEffect } from 'react';
import useWebSocket from '../../hooks/useWebSocket';
import './JoinRoom.css';

const JoinRoom = ({ onRoomJoined, onBackClick }) => {
    const [roomCode, setRoomCode] = useState('');
    const [userName, setUserName] = useState('');
    const [error, setError] = useState('');
    const [availableRooms, setAvailableRooms] = useState([]);
    const { sendMessage, messages, isConnected } = useWebSocket();
    
    useEffect(() => {
        if (isConnected) {
            sendMessage({ type: 'listRooms' });
        }
    }, [isConnected, sendMessage]);
    
    useEffect(() => {
        if (!messages || messages.length === 0) return;
        
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.type === 'roomList') {
            setAvailableRooms(lastMessage.rooms || []);
        }
    }, [messages]);
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!roomCode.trim()) {
            setError('Please enter a room code');
            return;
        }
        
        if (!userName.trim()) {
            setError('Please enter your name');
            return;
        }
        
        if (availableRooms.length > 0 && !availableRooms.includes(roomCode.toUpperCase())) {
            setError(`Room ${roomCode.toUpperCase()} does not exist. Please check the room code.`);
            return;
        }
        
        onRoomJoined(roomCode.toUpperCase(), userName);
    };

    const selectRoom = (room) => {
        setRoomCode(room);
        setError('');
    };

    return (
        <div className="join-room">
            <h2>Join a Poll</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="roomCode">Room Code:</label>
                    <input
                        type="text"
                        id="roomCode"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        placeholder="Enter room code"
                        maxLength={6}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="userName">Your Name:</label>
                    <input
                        type="text"
                        id="userName"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Enter your name"
                    />
                </div>
                {error && <p className="error">{error}</p>}
                <div className="form-buttons">
                    <button 
                        type="submit" 
                        disabled={!isConnected}
                        className="button"
                    >
                        Join Room
                    </button>
                    <button 
                        type="button" 
                        onClick={onBackClick} 
                        className="button button-outline"
                    >
                        Back
                    </button>
                </div>
            </form>
            
            {availableRooms.length > 0 && (
                <div className="available-rooms">
                    <div className="room-header">
                        <h3>Available Rooms</h3>
                        <button 
                            onClick={() => sendMessage({ type: 'listRooms' })}
                            className="refresh-button"
                        >
                            Refresh List
                        </button>
                    </div>
                    <div className="room-list">
                        {availableRooms.map(room => (
                            <button 
                                key={room} 
                                onClick={() => selectRoom(room)}
                                className={`room-button ${roomCode === room ? 'selected' : ''}`}
                            >
                                {room}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default JoinRoom;