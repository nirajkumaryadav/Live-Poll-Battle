const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { setupWebSocket } = require('./websocket/socketHandler');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ status: 'Live Poll Battle Server is running' });
});

wss.on('connection', (ws) => {
    console.log('New WebSocket client connected!');
    
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

setupWebSocket(wss);

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`WebSocket server is listening for connections`);
});