class FriendHandler {
    constructor(db){
      this.friend = db.collection('friend');
    }
  
    /**
     * Create a Friend object 
     * @param {*} friendToInsert
     */
    async createFriend(friendToInsert) {
      try {
        await this.friend.insertOne(friendToInsert);
      } catch (error) {
        throw error;
      }
    }
  
    /**
     * Get a Friend object in the database
     * @param {*} originalUser
     * @param {*} friendWith
     * @returns 
     */
    async getFriend(originalUser,friendWith){
      try {
        const friendship = await this.friend.findOne({originalUser: originalUser, friendWith: friendWith });
        return friendship;
      } catch (error) {
        throw error;
      }
    }
  
    /**
     * Delete friend of a user
     * @param {String} originalUser
     * @param {String} friendWith
     */
    async deleteFriend(originalUser,friendWith){
      try {
        const res = await this.friend.deleteOne({originalUser: originalUser, friendWith: friendWith})
        if(res.deletedCount == 1){
          return true;
        } else {
          return false;
        }
      } catch (error) {
        throw error;
      }
    }
  }
  
  module.exports = FriendHandler;