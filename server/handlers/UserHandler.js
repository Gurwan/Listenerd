const User = require('../models/User'); 
const UserParams = require('../models/UserParams'); 

class UserHandler {
  constructor(db){
    this.users = db.collection('users');
    this.users_params = db.collection('users-params');
  }
}

module.exports = UserHandler;

