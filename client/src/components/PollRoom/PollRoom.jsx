import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useUser } from '../../contexts/UserContext';
import useWebSocket from '../../hooks/useWebSocket';
import Timer from '../Timer/Timer';
import VoteResults from '../VoteResult/VoteResults';
import './PollRoom.css';

const PollRoom = ({ roomCode, userName, onExit }) => {
    const { setHasVoted } = useUser();
    const [question, setQuestion] = useState('Loading...');
    const [options, setOptions] = useState([]);
    const [votes, setVotes] = useState({});
    const [hasVoted, setLocalHasVoted] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isVotingActive, setIsVotingActive] = useState(true);
    const [timerDuration, setTimerDuration] = useState(60);
    const [error, setError] = useState(null);
    const [timerKey, setTimerKey] = useState(0);

    const { sendMessage, messages, isConnected } = useWebSocket();
    const [userCount, setUserCount] = useState(1);
    const [isJoining, setIsJoining] = useState(true);
    
    const timerIntervalRef = useRef(null);

    useEffect(() => {
        const savedState = sessionStorage.getItem(`room_${roomCode}_state`);
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            setQuestion(parsedState.question);
            setOptions(parsedState.options);
            setIsVotingActive(parsedState.isVotingActive);
        }

        const savedVotes = sessionStorage.getItem(`room_${roomCode}_votes`);
        if (savedVotes) {
            setVotes(JSON.parse(savedVotes));
        }

        refreshTimer();
        
        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, [roomCode]);

    const refreshTimer = useCallback(() => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }
        const serverStartTime = sessionStorage.getItem(`room_${roomCode}_serverStartTime`);
        const savedTimeLeft = sessionStorage.getItem(`room_${roomCode}_timeLeft`);
        const savedTimeStamp = sessionStorage.getItem(`room_${roomCode}_timeStamp`);
        let initialTime = 60;
        if (serverStartTime) {
            const totalElapsed = Math.floor((Date.now() - parseInt(serverStartTime)) / 1000);
            initialTime = Math.max(0, 60 - totalElapsed);
            if (initialTime <= 0) {
                setIsVotingActive(false);
                return;
            }
        } else if (savedTimeLeft && savedTimeStamp) {
            const elapsed = Math.floor((Date.now() - parseInt(savedTimeStamp)) / 1000);
            initialTime = Math.max(0, parseInt(savedTimeLeft) - elapsed);
            if (initialTime <= 0) {
                setIsVotingActive(false);
                return;
            }
        }
        setTimerDuration(initialTime);
        setTimerKey(prevKey => prevKey + 1);
        if (initialTime > 0 && isVotingActive) {
            timerIntervalRef.current = setInterval(() => {
                const serverStartTime = sessionStorage.getItem(`room_${roomCode}_serverStartTime`);
                if (serverStartTime) {
                    const totalElapsed = Math.floor((Date.now() - parseInt(serverStartTime)) / 1000);
                    const remaining = Math.max(0, 60 - totalElapsed);
                    setTimerDuration(remaining);
                    if (remaining <= 0) {
                        clearInterval(timerIntervalRef.current);
                        setIsVotingActive(false);
                    }
                }
            }, 1000);
        }
    }, [roomCode, isVotingActive]);

    useEffect(() => {
        if (isConnected && roomCode && userName) {
            setIsJoining(true);
            sendMessage({
                type: 'joinRoom',
                roomCode,
                userName
            });
        }
    }, [isConnected, roomCode, userName, sendMessage]);

    const handleVote = useCallback((option) => {
        if (hasVoted || !isVotingActive) return;
        setVotes(prevVotes => {
            const updatedVotes = { ...prevVotes };
            updatedVotes[option] = (updatedVotes[option] || 0) + 1;
            return updatedVotes;
        });
        setLocalHasVoted(true);
        setHasVoted(true);
        setSelectedOption(option);
        sessionStorage.setItem(`vote_${roomCode}_${userName}`, option);
        sendMessage({
            type: 'vote',
            option,
            userName,
            roomCode
        });
    }, [hasVoted, isVotingActive, roomCode, userName, sendMessage, setHasVoted]);

    useEffect(() => {
        if (!messages || messages.length === 0) return;
        const lastMessage = messages[messages.length - 1];
        if (!lastMessage) return;
        switch (lastMessage.type) {
            case 'roomJoined':
                setIsJoining(false);
                if (lastMessage.room) {
                    setQuestion(lastMessage.room.question);
                    setOptions(lastMessage.room.options);
                    setVotes({ ...lastMessage.room.votes });
                    setIsVotingActive(lastMessage.room.isVotingActive);
                    if (typeof lastMessage.room.userCount === 'number') {
                        setUserCount(lastMessage.room.userCount);
                    }
                    sessionStorage.setItem(`room_${roomCode}_state`, JSON.stringify({
                        question: lastMessage.room.question,
                        options: lastMessage.room.options,
                        isVotingActive: lastMessage.room.isVotingActive
                    }));
                    if (lastMessage.room.startTime) {
                        sessionStorage.setItem(`room_${roomCode}_serverStartTime`, lastMessage.room.startTime);
                        refreshTimer();
                    }
                    if (typeof lastMessage.room.timeLeft === 'number') {
                        setTimerDuration(lastMessage.room.timeLeft);
                        sessionStorage.setItem(`room_${roomCode}_timeLeft`, lastMessage.room.timeLeft);
                        sessionStorage.setItem(`room_${roomCode}_timeStamp`, Date.now());
                        refreshTimer();
                    }
                    sessionStorage.setItem(`room_${roomCode}_votes`, JSON.stringify(lastMessage.room.votes));
                }
                break;
            case 'voteUpdate':
                if (lastMessage.votes) {
                    setVotes({ ...lastMessage.votes });
                    sessionStorage.setItem(`room_${roomCode}_votes`, JSON.stringify(lastMessage.votes));
                }
                if (typeof lastMessage.userCount === 'number') {
                    setUserCount(lastMessage.userCount);
                }
                break;
            case 'userJoined':
                setUserCount(count => count + 1);
                break;
            case 'userLeft':
                setUserCount(count => Math.max(1, count - 1));
                break;
            case 'votingEnded':
                setIsVotingActive(false);
                if (lastMessage.votes) {
                    setVotes({ ...lastMessage.votes });
                }
                break;
            case 'error':
                setIsJoining(false);
                console.error('Server error:', lastMessage.message);
                setError(lastMessage.message);
                if (lastMessage.availableRooms) {
                    sessionStorage.setItem('availableRooms', JSON.stringify(lastMessage.availableRooms));
                }
                break;
            case 'voteStatus':
                if (lastMessage.userName === userName &&
                    lastMessage.roomCode === roomCode &&
                    lastMessage.hasVoted) {
                    setLocalHasVoted(true);
                    setHasVoted(true);
                }
                break;
            default:
                break;
        }
    }, [messages, roomCode, userName, refreshTimer]);

    useEffect(() => {
        const storedVote = sessionStorage.getItem(`vote_${roomCode}_${userName}`);
        if (storedVote) {
            setLocalHasVoted(true);
            setHasVoted(true);
            setSelectedOption(storedVote);
        } else if (roomCode && userName && isConnected) {
            sendMessage({
                type: 'checkVoteStatus',
                roomCode,
                userName
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomCode, userName, isConnected]);

    if (error) {
        const availableRoomsStr = sessionStorage.getItem('availableRooms');
        const availableRooms = availableRoomsStr ? JSON.parse(availableRoomsStr) : [];

        return (
            <div className="error-container">
                <h3>Error</h3>
                <p className="error-message">{error}</p>

                {availableRooms.length > 0 && (
                    <div style={{ margin: '15px 0' }}>
                        <p><strong>Available rooms:</strong></p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px' }}>
                            {availableRooms.map(room => (
                                <button
                                    key={room}
                                    onClick={() => {
                                        sessionStorage.setItem('currentRoomCode', room);
                                        window.location.reload();
                                    }}
                                    className="button"
                                >
                                    {room}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <button
                    onClick={onExit}
                    className="button button-success"
                >
                    Return to Home
                </button>
            </div>
        );
    }

    // Memoize winner calculation
    const winner = useMemo(() => {
        if (options.length >= 2 && votes[options[0]] !== votes[options[1]]) {
            return options.reduce((winner, option) =>
                (votes[option] > votes[winner] ? option : winner),
                options[0]
            );
        }
        return null;
    }, [options, votes]);

    if (isJoining) {
        return (
            <div className="poll-room">
                <div className="loading-spinner" style={{textAlign: 'center', marginTop: '2rem'}}>
                    <div className="spinner" style={{margin: 'auto', width: 40, height: 40, border: '4px solid #ccc', borderTop: '4px solid #333', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
                    <p>Joining room...</p>
                </div>
            </div>
        );
    }
    return (
        <div className="poll-room">
            <h2>Poll Room: {roomCode}</h2>
            <h3>Question: {question}</h3>
            <div style={{marginBottom: '1rem', color: '#666'}}>Users in room: {userCount}</div>
            <div className="options-container">
                {options.map((option) => (
                    <div key={option} className="poll-option">
                        <button
                            onClick={() => handleVote(option)}
                            disabled={hasVoted || !isVotingActive}
                            className={selectedOption === option ? "selected" : ""}
                        >
                            {option}
                        </button>
                        <span className="vote-count"> {votes[option] || 0} votes</span>
                    </div>
                ))}
            </div>
            {isVotingActive ? (
                <Timer key={timerKey} duration={timerDuration} onEnd={() => setIsVotingActive(false)} />
            ) : (
                <div className="voting-ended">
                    <p>Voting has ended</p>
                    {winner && (
                        <p className="winner">Winner: {winner}</p>
                    )}
                    {options.length >= 2 && votes[options[0]] === votes[options[1]] && votes[options[0]] > 0 && (
                        <p className="tie">It's a tie!</p>
                    )}
                </div>
            )}
            {hasVoted && (
                <div className="voted-message">
                    <p>You voted for: {selectedOption}</p>
                </div>
            )}
            <div className="results-section">
                <h3>Live Results</h3>
                {options.length === 2 && (
                    <VoteResults
                        votes={votes}
                        options={options}
                    />
                )}
            </div>
            <div className="action-buttons">
                <button onClick={onExit} className="button exit-button">
                    Leave Room
                </button>
            </div>
        </div>
    );
};

export default PollRoom;