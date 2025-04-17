import React, { useState, useEffect } from 'react';
import { UserProvider } from './contexts/UserContext';
import CreateRoom from './components/CreateRoom';
import JoinRoom from './components/JoinRoom';
import PollRoom from './components/PollRoom';
import AnimatedLogo from './components/AnimatedLogo';
import FeaturesList from './components/FeaturesList';
import useWebSocket from './hooks/useWebSocket';
import { VIEWS } from './constants';
import Layout from './components/Layout';
import Button from './components/common/Button';
import './styles.css';

const App = () => {
  const [userName, setUserName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [view, setView] = useState(VIEWS.HOME);
  
  const { isConnected } = useWebSocket();

  const handleRoomCreate = (room, name) => {
    setRoomCode(room);
    setUserName(name);
    setView(VIEWS.POLL);
    
    sessionStorage.setItem('currentRoomCode', room);
    sessionStorage.setItem('currentUserName', name);
  };
  
  const handleRoomJoin = handleRoomCreate;
  
  const handleExit = () => {
    setView(VIEWS.HOME);
    sessionStorage.removeItem('currentRoomCode');
    sessionStorage.removeItem('currentUserName');
  };
  
  useEffect(() => {
    const savedRoom = sessionStorage.getItem('currentRoomCode');
    const savedName = sessionStorage.getItem('currentUserName');
    
    if (savedRoom && savedName) {
      setRoomCode(savedRoom);
      setUserName(savedName);
      setView(VIEWS.POLL);
    }
  }, []);

  return (
    <UserProvider>
      <Layout title={view === VIEWS.HOME ? null : 'Live Poll Battle'}>
        {view === VIEWS.HOME && (
          <>
            {}
            <div className="background-animation">
              <div className="background-circle bg-circle-1"></div>
              <div className="background-circle bg-circle-2"></div>
              <div className="background-circle bg-circle-3"></div>
            </div>
            
            {}
            <h1 className="animated-title">Live Poll Battle</h1>
            
            <AnimatedLogo />
            
            <p className="app-description">
              Create interactive polls and see results in real-time. 
              Challenge friends and colleagues to vote on your favorite topics!
            </p>
            
            <div className="home-buttons">
              <Button onClick={() => setView(VIEWS.CREATE)}>Create Room</Button>
              <Button onClick={() => setView(VIEWS.JOIN)}>Join Room</Button>
            </div>
            
            <FeaturesList />
          </>
        )}
        
        {view === VIEWS.CREATE && (
          <CreateRoom 
            onRoomCreated={handleRoomCreate}
            onBackClick={() => setView(VIEWS.HOME)}
          />
        )}
        
        {view === VIEWS.JOIN && (
          <JoinRoom 
            onRoomJoined={handleRoomJoin} 
            onBackClick={() => setView(VIEWS.HOME)}
          />
        )}
        
        {view === VIEWS.POLL && roomCode && (
          <PollRoom 
            roomCode={roomCode} 
            userName={userName} 
            onExit={handleExit}
          />
        )}
      </Layout>
    </UserProvider>
  );
};

export default App;
