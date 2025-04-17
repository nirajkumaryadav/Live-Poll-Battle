const storage = {
  /**
   * @param {string} key 
   * @param {*} value
   */
  setItem: (key, value) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Error saving to session storage:', e);
    }
  },

  /**
   * @param {string} key 
   * @param {*} defaultValue 
   * @returns {*} 
   */
  getItem: (key, defaultValue = null) => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error('Error reading from session storage:', e);
      return defaultValue;
    }
  },

  /**
   * @param {string} key 
   */
  removeItem: (key) => {
    try {
      sessionStorage.removeItem(key);
    } catch (e) {
      console.error('Error removing from session storage:', e);
    }
  },

  /**
   * @param {string} roomCode 
   * @param {Object} data  
   */
  setRoomData: (roomCode, data) => {
    storage.setItem(`room_${roomCode}`, data);
  },

  /**
   * @param {string} roomCode 
   * @returns {Object} 
   */
  getRoomData: (roomCode) => {
    return storage.getItem(`room_${roomCode}`, {});
  },

  /**
   * @param {string} roomCode
   * @param {string} userName 
   * @param {string} vote 
   */
  setUserVote: (roomCode, userName, vote) => {
    storage.setItem(`vote_${roomCode}_${userName}`, vote);
  },

  /**
   * @param {string} roomCode 
   * @param {string} userName 
   * @returns {string|null} 
   */
  getUserVote: (roomCode, userName) => {
    return storage.getItem(`vote_${roomCode}_${userName}`);
  }
};

export default storage;