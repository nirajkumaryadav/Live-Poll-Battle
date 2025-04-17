import React, { useEffect, useState } from 'react';
import './Timer.css';

const Timer = ({ duration, onEnd }) => {
    const [displayTime, setDisplayTime] = useState(duration);
    const percentage = (displayTime / 60) * 100; 
    
    useEffect(() => {
        setDisplayTime(duration);
        
        if (duration <= 0) {
            onEnd();
            return;
        }
        
        const intervalId = setInterval(() => {
            setDisplayTime(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(intervalId);
                    onEnd();
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);
        
        return () => {
            clearInterval(intervalId);
        };
    }, [duration, onEnd]);
    
    const getColor = () => {
        if (displayTime > 30) return '#4caf50'; 
        if (displayTime > 10) return '#ff9800';
        return '#f44336'; 
    };
    
    return (
        <div className="timer">
            <h2>Time Remaining: {displayTime} seconds</h2>
            
            {}
            <div className="timer-progress-bar">
                <div 
                    className="timer-progress" 
                    style={{
                        width: `${percentage}%`,
                        backgroundColor: getColor()
                    }} 
                />
            </div>
        </div>
    );
};

export default Timer;