import { useState, useEffect, useCallback } from 'react';

const WS_STATES = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
};

let globalWs = null;
let messageQueue = [];
let globalListeners = [];

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:4000';

/**
 * @returns {Object} 
 */
const useWebSocket = () => {
    const [messages, setMessages] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    
    useEffect(() => {
        const handleMessage = (message) => {
            setMessages(prevMessages => [...prevMessages, message]);
        };
        
        globalListeners.push(handleMessage);
        
        if (globalWs && globalWs.readyState === WS_STATES.OPEN) {
            setIsConnected(true);
        }
        
        if (!globalWs || globalWs.readyState === WS_STATES.CLOSED) {
            setupGlobalWebSocket();
        }
        
        return () => {
            globalListeners = globalListeners.filter(listener => listener !== handleMessage);
        };
    }, []);
    
    const setupGlobalWebSocket = () => {
        try {
            const ws = new WebSocket(WS_URL);
            globalWs = ws;
            
            ws.onopen = () => {
                setIsConnected(true);
                processQueuedMessages();
            };
            
            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    globalListeners.forEach(listener => listener(message));
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };
            
            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                setIsConnected(false);
            };
            
            ws.onclose = () => {
                setIsConnected(false);
                
                setTimeout(() => {
                    if (!globalWs || globalWs.readyState === WS_STATES.CLOSED) {
                        setupGlobalWebSocket();
                    }
                }, 3000);
            };
        } catch (error) {
            console.error('Error establishing WebSocket connection:', error);
            setIsConnected(false);
            
            setTimeout(setupGlobalWebSocket, 3000);
        }
    };
    
    const processQueuedMessages = () => {
        while (messageQueue.length > 0 && globalWs?.readyState === WS_STATES.OPEN) {
            const queuedMessage = messageQueue.shift();
            globalWs.send(JSON.stringify(queuedMessage));
        }
    };
    
    /**
     * @param {Object} message 
     */
    const sendMessage = useCallback((message) => {
        if (globalWs && globalWs.readyState === WS_STATES.OPEN) {
            globalWs.send(JSON.stringify(message));
        } else {
            messageQueue.push(message);
            
            if (!globalWs || globalWs.readyState === WS_STATES.CLOSED) {
                setupGlobalWebSocket();
            }
        }
    }, []);
    
    return { sendMessage, messages, isConnected };
};

export default useWebSocket;