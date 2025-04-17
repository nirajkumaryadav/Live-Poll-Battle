import React from 'react';
import './FeaturesList.css';

const FeaturesList = () => {
  const features = [
    { icon: '🔍', title: 'Create Polls', description: 'Create custom polls in seconds' },
    { icon: '🚀', title: 'Real-time Results', description: 'Watch results update instantly as people vote' },
    { icon: '⏱️', title: 'Timed Voting', description: '60-second countdown creates excitement' },
    { icon: '🏆', title: 'See Winners', description: 'Instantly see which option wins the battle' }
  ];

  return (
    <div className="features-container">
      {features.map((feature, index) => (
        <div className="feature-card" key={index} style={{ animationDelay: `${index * 0.2}s` }}>
          <div className="feature-icon">{feature.icon}</div>
          <h3>{feature.title}</h3>
          <p>{feature.description}</p>
        </div>
      ))}
    </div>
  );
};

export default FeaturesList;