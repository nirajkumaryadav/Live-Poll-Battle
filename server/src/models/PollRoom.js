class PollRoom {
    constructor(roomCode, question, options) {
        this.roomCode = roomCode;
        this.question = question;
        this.options = options;
        this.votes = { [options[0]]: 0, [options[1]]: 0 };
        this.voters = new Set();
        this.isVotingActive = true;
        this.timer = null;
        this.startTime = null; 
    }

    vote(option, userName) {
        if (!this.isVotingActive) {
            throw new Error("Voting has ended.");
        }
        if (this.voters.has(userName)) {
            throw new Error("User has already voted.");
        }
        if (!this.options.includes(option)) {
            throw new Error("Invalid voting option.");
        }

        this.votes[option]++;
        this.voters.add(userName);
    }

    endVoting() {
        this.isVotingActive = false;
        clearTimeout(this.timer);
    }

    startVoting(duration) {
        this.startTime = Date.now(); 
        this.timer = setTimeout(() => {
            this.endVoting();
        }, duration);
    }

    getResults() {
        let timeLeft = 60; 
        
        if (this.startTime) {
            if (this.isVotingActive) {
                const elapsedMs = Date.now() - this.startTime;
                timeLeft = Math.max(0, Math.ceil((60000 - elapsedMs) / 1000)); 
                console.log(`Room ${this.roomCode} - Calculating timeLeft: ${timeLeft}s`);
            } else {
                timeLeft = 0; 
            }
        }
        
        return {
            question: this.question,
            options: this.options,
            votes: {...this.votes}, 
            isVotingActive: this.isVotingActive,
            timeLeft: timeLeft,
            startTime: this.startTime 
        };
    }
}

module.exports = PollRoom;