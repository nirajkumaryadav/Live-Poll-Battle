import React from 'react';
import './VoteResults.css';

const VoteResults = ({ votes, options = ['Cats', 'Dogs'] }) => {
    const optionA = options[0];
    const optionB = options[1];
    const voteA = votes && votes[optionA] ? Number(votes[optionA]) : 0;
    const voteB = votes && votes[optionB] ? Number(votes[optionB]) : 0;
    const totalVotes = voteA + voteB;
    
    const percentA = totalVotes > 0 ? (voteA / totalVotes) * 100 : 0;
    const percentB = totalVotes > 0 ? (voteB / totalVotes) * 100 : 0;

    return (
        <div className="vote-results">
            {}
            <div className="option">
                <div className="option-header">
                    <span>{optionA}</span>
                    <span>
                        {voteA} {totalVotes > 0 && `(${percentA.toFixed(1)}%)`}
                    </span>
                </div>
                <div className="progress-bar">
                    <div 
                        className="progress-bar-fill progress-bar-fill-a" 
                        style={{ width: `${percentA}%` }} 
                    />
                </div>
            </div>
            
            {}
            <div className="option">
                <div className="option-header">
                    <span>{optionB}</span>
                    <span>
                        {voteB} {totalVotes > 0 && `(${percentB.toFixed(1)}%)`}
                    </span>
                </div>
                <div className="progress-bar">
                    <div 
                        className="progress-bar-fill progress-bar-fill-b" 
                        style={{ width: `${percentB}%` }} 
                    />
                </div>
            </div>
            
            <div className="total-votes">
                Total votes: {totalVotes}
            </div>
        </div>
    );
};

export default VoteResults;