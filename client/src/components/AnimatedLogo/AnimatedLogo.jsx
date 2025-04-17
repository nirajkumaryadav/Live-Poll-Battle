import React from 'react';
import './AnimatedLogo.css';

const AnimatedLogo = () => {
  return (
    <div className="logo-container">
      <div className="logo-circle"></div>
      <div className="logo-vs">VS</div>
      <div className="logo-particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle"></div>
        ))}
      </div>
    </div>
  );
};

export default AnimatedLogo;