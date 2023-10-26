const User = require('../models/User'); 

class UserHandler {
  constructor(db){
    this.users = db.collection('users');
  }

  /**
   * Create a user : use during the register procedure.
   * @param {*} user
   */
  async createUser(user) {
    try {
      await this.users.insertOne(user);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a user in the database
   * Can be used to verify whether the user exists in the database
   * Also useful to get data of the user or to get UserParams associated to it
   * @param {*} username 
   * @returns 
   */
  async getUser(username){
    try {
      const user = await this.users.findOne({ username });
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update data of a User : photo can be updated, lists, artists followed and country 
   * @param {String} username
   * @param {*} update : {$set { key: value}}
   */
  async updateUser(username, update){
    try {
      await this.users.updateOne({username: username}, update)
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserHandler;

