const PollRoom = require('../models/PollRoom');

let pollRooms = {};

const createPollRoom = (req, res) => {
    const { roomCode, question, options } = req.body;
    if (pollRooms[roomCode]) {
        return res.status(400).json({ message: 'Room already exists' });
    }
    pollRooms[roomCode] = new PollRoom(roomCode, question, options);
    res.status(201).json({ message: 'Poll room created', roomCode });
};

const joinPollRoom = (req, res) => {
    const { roomCode } = req.params;
    if (!pollRooms[roomCode]) {
        return res.status(404).json({ message: 'Room not found' });
    }
    res.status(200).json({ message: 'Joined poll room', room: pollRooms[roomCode] });
};

const voteInPoll = (req, res) => {
    const { roomCode, option } = req.body;
    const pollRoom = pollRooms[roomCode];
    if (!pollRoom) {
        return res.status(404).json({ message: 'Room not found' });
    }
    if (pollRoom.hasVoted(req.user.name)) {
        return res.status(403).json({ message: 'User has already voted' });
    }
    pollRoom.vote(option, req.user.name);
    res.status(200).json({ message: 'Vote recorded', votes: pollRoom.getVotes() });
};

const getPollResults = (req, res) => {
    const { roomCode } = req.params;
    const pollRoom = pollRooms[roomCode];
    if (!pollRoom) {
        return res.status(404).json({ message: 'Room not found' });
    }
    res.status(200).json({ votes: pollRoom.getVotes() });
};

module.exports = {
    createPollRoom,
    joinPollRoom,
    voteInPoll,
    getPollResults,
};