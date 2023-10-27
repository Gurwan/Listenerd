const UserParams = require('../models/UserParams'); 

class UserParamsHandler {
  constructor(db){
    this.users_params = db.collection('users-params');
  }

  /**
   * Create a UserParams object : use to store some data such as the scale of the album rating and personalization of colors.
   * @param {*} userParams
   */
  async createUserParams(userParams) {
    try {
      await this.users_params.insertOne(userParams);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a UserParams object in the database
   * Can be used to show the personalized rating
   * @param {*} username of the User associated 
   * @returns 
   */
  async getUserParams(username){
    try {
      const userParams = await this.users_params.findOne({username: username });
      return userParams;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update scale or colors or range of rating
   * @param {String} username of the User associated 
   * @param {*} update : {$set { key: value}}
   */
  async updateUserParams(filter, update){
    try {
      const res = await this.users_params.updateOne(filter, update)
      if(res.modifiedCount == 1){
        return true;
      } else {
        return false;
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserParamsHandler;

