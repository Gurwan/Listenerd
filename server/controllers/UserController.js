const UserHandler = require('../handlers/UserHandler'); 
const UserParamsHandler = require('../handlers/UserParamsHandler'); 
const bcrypt = require('bcrypt');
const User = require('../models/User.js');
const UserParams = require('../models/UserParams.js');


class UserController {
    constructor(db){
        this.userHandler = new UserHandler(db);
        this.userParamsHandler = new UserParamsHandler(db);
    }

    /**
     * Register method
     * @param {*} username 
     * @param {*} password 
     * @returns if success of the operation [true,id of the new user] else [false, error code]
     */
    async register(username,password){
        try {
            let user = await this.userHandler.getUser(username);
            if(user == null){
                const salt = await bcrypt.genSalt(10);
                let cryptedPassword = await bcrypt.hash(password, salt);
                user = new User(username,cryptedPassword);
                const resHandler = this.userHandler.createUser(user);
                const userParams = new UserParams(username);
                const resHandlerParams = this.userParamsHandler.createUserParams(userParams);
                if(resHandler && resHandlerParams){
                    return [true,user.id];
                } else {
                    return [false,500];
                }
            } else {
                return [false,400];
            }
        } catch (err){
            console.log(err);
            return [false,500];
        }
    }

    /**
     * Login method
     * @param {*} username 
     * @param {*} password 
     * @returns if success of the operation [true,username of the user connected] else [false, error code]
     */
    async login(username, password){
        try {
            const user = await this.userHandler.getUser(username);
            if(user){
                const passwordOk = await bcrypt.compare(password, user.password);
                if(passwordOk){
                    return [true,user.username];
                } else {
                    return [false,401];
                }
            } else {
                return [false,400];
            }
        } catch (error){
            console.log(error)
            return [false, 500];
        }
    }

    /**
     * Method allowing to get the country of the connected user
     * Used to adapt the albums displayed on the home page
     * @param {*} username 
     * @returns if success of the operation [true,country of the user connected] else [false, error code]
     */
    async getCountryOfUser(username){
        try {
            const user = await this.userHandler.getUser(username);
            if(user){
                const country = user.country;
                if(country != null){
                    return [true,country];
                } else {
                    return [false,404];
                }
            } else {
                return [false,404];
            }
        } catch (error){
            return [false, 500];
        }
    }
}

module.exports = UserController;
