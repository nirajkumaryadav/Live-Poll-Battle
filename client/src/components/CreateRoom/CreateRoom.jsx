import React, { useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import useWebSocket from '../../hooks/useWebSocket';
import './CreateRoom.css';

const CreateRoom = ({ onRoomCreated, onBackClick }) => {
    const { setUserName } = useUser();
    const [name, setName] = useState('');
    const [question, setQuestion] = useState('');
    const [optionA, setOptionA] = useState('');
    const [optionB, setOptionB] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { sendMessage, messages, isConnected } = useWebSocket();

    React.useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.type === 'roomCreated') {
            setIsLoading(false);
            setUserName(name);
            onRoomCreated(lastMessage.roomCode, name);
        }
    }, [messages, name, onRoomCreated, setUserName]);

    const handleCreateRoom = (e) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Please enter your name.');
            return;
        }

        if (!question.trim()) {
            setError('Please enter a poll question.');
            return;
        }

        if (!optionA.trim() || !optionB.trim()) {
            setError('Please enter both poll options.');
            return;
        }

        if (optionA.trim() === optionB.trim()) {
            setError('Poll options must be different.');
            return;
        }
        
        setIsLoading(true);
        sendMessage({
            type: 'createRoom',
            question: question.trim(),
            options: [optionA.trim(), optionB.trim()],
            userName: name
        });
    };

    return (
        <div className="create-room">
            <h2>Create a New Poll</h2>
            
            <form onSubmit={handleCreateRoom}>
                <div className="form-group">
                    <label htmlFor="userName">Your Name</label>
                    <input
                        type="text"
                        id="userName"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="question">Poll Question</label>
                    <input
                        type="text"
                        id="question"
                        placeholder="e.g., Cats vs Dogs"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>
                
                <div className="form-divider">
                    <span>Poll Options</span>
                </div>
                
                <div className="option-inputs">
                    <div className="form-group">
                        <label htmlFor="optionA">Option A</label>
                        <input
                            type="text"
                            id="optionA"
                            placeholder="e.g., Cats"
                            value={optionA}
                            onChange={(e) => setOptionA(e.target.value)}
                        required
                        disabled={isLoading}
                        />
                    </div>
                    
                    <div className="versus-divider">VS</div>
                    
                    <div className="form-group">
                        <label htmlFor="optionB">Option B</label>
                        <input
                            type="text"
                            id="optionB"
                            placeholder="e.g., Dogs"
                            value={optionB}
                            onChange={(e) => setOptionB(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                </div>
                
                {error && <p className="error">{error}</p>}
                
                <div className="form-actions">
                    <button 
                        type="submit" 
                        className="button" 
                        disabled={!isConnected || isLoading}
                    >
                        {isLoading ? (
                            <span className="loading-spinner">Creating...</span>
                        ) : (
                            'Create Poll'
                        )}
                    </button>
                    
                    <button 
                        type="button" 
                        className="button button-outline"
                        onClick={onBackClick}
                        disabled={isLoading}
                    >
                        Back
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateRoom;