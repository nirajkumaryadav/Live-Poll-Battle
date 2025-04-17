const WebSocket = require('ws');
const PollRoom = require('../models/PollRoom');

const setupWebSocket = (wss) => {
    const rooms = {};

    const handleTimerEnd = (roomCode) => {
        if (rooms[roomCode]) {
            rooms[roomCode].endVoting();
            broadcast(wss, roomCode, { 
                type: 'votingEnded',
                votes: rooms[roomCode].getResults().votes
            });
        }
    };

    wss.on('connection', (ws) => {
        let currentRoom = null;
        let userName = null;

        ws.on('message', (message) => {
            const data = JSON.parse(message);

            switch (data.type) {
                case 'createRoom':
                    const roomCode = generateRoomCode();
                    rooms[roomCode] = new PollRoom(roomCode, data.question || 'Cats vs Dogs', data.options || ['Cats', 'Dogs']);
                    
                    currentRoom = roomCode;
                    userName = data.userName;
                    ws.roomCode = roomCode;
                    
                    rooms[roomCode].startVoting(60000);
                    
                    setTimeout(() => {
                        handleTimerEnd(roomCode);
                    }, 60000);
                    
                    ws.send(JSON.stringify({ 
                        type: 'roomCreated', 
                        roomCode,
                        room: rooms[roomCode].getResults()
                    }));

                    listActiveRooms();
                    break;

                case 'joinRoom':
                    currentRoom = data.roomCode.toUpperCase();
                    userName = data.userName;
                    ws.roomCode = currentRoom;
                    
                    console.log(`\n>>>>> JOIN REQUEST: User ${userName} joining room ${currentRoom}`);
                    
                    const matchingRoom = Object.keys(rooms).find(
                        code => code.toUpperCase() === currentRoom
                    );
                    
                    if (matchingRoom) {
                        currentRoom = matchingRoom;
                        ws.roomCode = currentRoom;
                        
                        const roomData = rooms[currentRoom].getResults();
                        
                        if (rooms[currentRoom].startTime && rooms[currentRoom].isVotingActive) {
                            const now = Date.now();
                            const elapsedMs = now - rooms[currentRoom].startTime;
                            const remainingMs = Math.max(0, 60000 - elapsedMs);
                            const remainingSec = Math.ceil(remainingMs / 1000);
                            
                            console.log('------ Timer Calculation ------');
                            console.log(`Room ${currentRoom} - Start time: ${new Date(rooms[currentRoom].startTime).toLocaleString()}`);
                            console.log(`Room ${currentRoom} - Current time: ${new Date(now).toLocaleString()}`);
                            console.log(`Room ${currentRoom} - Elapsed time: ${elapsedMs} ms (${Math.floor(elapsedMs/1000)} seconds)`);
                            console.log(`Room ${currentRoom} - Remaining time: ${remainingMs} ms (${remainingSec} seconds)`);
                            console.log('------------------------------');
                            
                            roomData.timeLeft = remainingSec;
                            console.log('UPDATED timeLeft:', roomData.timeLeft);
                            
                            roomData.startTime = rooms[currentRoom].startTime;
                        }
                        
                        console.log('Final room data to send:', JSON.stringify(roomData));
                        
                        const responseMsg = { 
                            type: 'roomJoined', 
                            room: roomData 
                        };
                        ws.send(JSON.stringify(responseMsg));
                        console.log('Sent to client:', JSON.stringify(responseMsg));
                        
                        broadcast(wss, currentRoom, { 
                            type: 'userJoined', 
                            userName 
                        });
                    } else {
                        console.log(`Room not found: ${currentRoom}`);
                        console.log('Available rooms:', Object.keys(rooms));
                        
                        const activeRooms = Object.keys(rooms).filter(code => 
                            rooms[code] && rooms[code].isVotingActive
                        );
                        
                        ws.send(JSON.stringify({ 
                            type: 'error', 
                            message: `Room "${currentRoom}" does not exist. Please check the room code and try again.`,
                            availableRooms: activeRooms
                        }));
                    }
                    break;

                case 'vote':
                    if (currentRoom && rooms[currentRoom]) {
                        try {
                            rooms[currentRoom].vote(data.option, userName);
                            
                            const roomData = rooms[currentRoom].getResults();
                            
                            console.log(`Vote processed: ${userName} → ${data.option} in ${currentRoom}`);
                            console.log('Current votes:', roomData.votes);
                            
                            broadcast(wss, currentRoom, { 
                                type: 'voteUpdate', 
                                votes: roomData.votes
                            });
                        } catch (error) {
                            ws.send(JSON.stringify({ type: 'error', message: error.message }));
                        }
                    }
                    break;

                case 'checkVoteStatus':
                    if (rooms[data.roomCode]) {
                        const hasVoted = rooms[data.roomCode].voters.has(data.userName);
                        ws.send(JSON.stringify({ 
                            type: 'voteStatus', 
                            hasVoted,
                            userName: data.userName,
                            roomCode: data.roomCode
                        }));
                    }
                    break;

                case 'listRooms':
                    const activeRooms = Object.keys(rooms).filter(code => 
                        rooms[code] && rooms[code].isVotingActive
                    );
                    
                    console.log("List of active rooms requested:", activeRooms);
                    
                    ws.send(JSON.stringify({ 
                        type: 'roomList', 
                        rooms: activeRooms 
                    }));
                    break;

                default:
                    break;
            }
        });

        ws.on('close', () => {
            if (currentRoom && userName && rooms[currentRoom]) {
                broadcast(wss, currentRoom, { type: 'userLeft', userName });
            }
        });
    });

    const broadcast = (wss, roomCode, message) => {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN && client.roomCode === roomCode) {
                client.send(JSON.stringify(message));
            }
        });
    };

    const generateRoomCode = () => {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    };

    const listActiveRooms = () => {
        console.log("\n===== ACTIVE ROOMS =====");
        Object.keys(rooms).forEach(roomCode => {
            console.log(`Room: ${roomCode} - Active: ${rooms[roomCode].isVotingActive}`);
        });
        console.log("=======================\n");
    };
};

module.exports = { setupWebSocket };