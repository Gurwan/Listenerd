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
   * Get all users of the database
   * For search feature
   * @returns all the users
   */
  async getAllUsers(){
    try {
      const users = await this.users.find({});
      return users;
    } catch (error){
      throw error;
    }
  }

  /**
   * Get users with username 
   * @param {*} s 
   */
  async getUsers(s){
    try {
      const regexSearch = new RegExp(s, 'i');
      const users = await this.users.find({username: regexSearch});
      return users;
    } catch (error){
      throw error;
    }
  }

  /**
   * Update data of a User : photo can be updated, lists, artists followed and country 
   * @param {String} username
   * @param {*} update : {$set { key: value}}
   */
  async updateUser(filter, update){
    try {
      const res = await this.users.updateOne(filter, update)
      if(res.modifiedCount == 1){
        return true;
      } else {
        return false;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a User of the database 
   * @param {String} username
   */
  async deleteUser(username){
    try {
      const res = await this.users.deleteOne({username: username})
      if(res.deletedCount == 1){
        return true;
      } else {
        console.log(res)
        return false;
      }
    } catch (error) {
      throw error;
    }
  }

}

module.exports = UserHandler;

