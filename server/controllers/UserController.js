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

    /**
     * Method allowing to get covers to show the preview of lists on the profile page
     * @param {*} username 
     * @param {*} albumController use its getCoverList method
     * @returns if success of the operation [true,the user,covers of lists] else [false, error code]
     */
    async getUserData(username,albumController,artistController){
        try {
            const user = await this.userHandler.getUser(username);
            if(user){
              const preview = [];
              //to listen
              const resControllerAlbum0 = await albumController.getCoversList(user.toListen,false)
              if(resControllerAlbum0[0]){
                preview[0] = resControllerAlbum0[1];
              }
              //liked
              const resControllerAlbum1 = await albumController.getCoversList(user.liked,true)
              if(resControllerAlbum1[0]){
                preview[1] = resControllerAlbum1[1];
              } else {
                console.log('error liked' + resControllerAlbum1[1])
              }
              //followed artists
              const resControllerArtist = await artistController.getPicturesList(user.artistFollowed)
              if(resControllerArtist[0]){
                preview[2] = resControllerArtist[1];
              }
              return [true,user,preview]
            } else {
              return [false,404];
            }
        } catch (error){
            console.log(error)
            return [false,500];
        }
    }

    /**
     * This method returns the params associated with a specific user
     * @param {*} username 
     * @returns if success of the operation [true,params of the user] else [false, error code]
     */
    async getUserParams(username){
        try {
          const params = await this.userParamsHandler.getUserParams(username);
          if(params){
            return [true,params];
          } else {
            return [false,404];
          }
        } catch (error){
            return [false,500];
        }
    }

    /**
     * Return values in one of the list of the user
     * @param {*} username 
     * @param {*} list 
     * @param {*} artistController 
     * @param {*} albumController 
     * @returns if success of the operation [true,content of list] else [false, error code]
     */
    async getUserList(username,list,artistController,albumController,accessTokenSpotify){
        try {
            const user = await this.userHandler.getUser(username);
            if(user){
                switch(list){
                    case 0:
                    case '0':
                        const resAlbumController = await albumController.getList(user.toListen,false,artistController);
                        if(resAlbumController[0]){
                            return [true,resAlbumController[1]];
                        } else {
                            return [false,resAlbumController[1]]
                        }
                    case 1:
                    case '1':    
                        //sort album by grade from now
                        user.liked.sort((a, b) => b.rate - a.rate);
                        const resAlbumController1 = await albumController.getList(user.liked,true,artistController);
                        const userParams = await this.userParamsHandler.getUserParams(username);     
                        if(resAlbumController1[0]){
                            const resultLiked = resAlbumController1[1];
                            return [true,{resultLiked,userParams}];
                        } else {
                            return [false,resAlbumController1[1]]
                        }
                    case 2:
                    case '2':
                        const resArtistController = await artistController.getFollowedArtists(user.artistFollowed,accessTokenSpotify);
                        if(resArtistController[0]){
                            return [true,resArtistController[1]];
                        } else {
                            return [false,resArtistController[1]]
                        }
                    default:
                        return [false,400]
                }
            } else {
                return [false,404];
            }
        } catch (error){
            console.log(error)
            return [false,500];
        }
    }

    /**
     * Update the profile picture of a user
     * @param {*} username 
     * @param {*} file 
     * @param {*} type 
     * @returns if success of the operation [true,success code] else [false, error code]
     */
    async updatePicture(username,file,type){
        try {
            const user = await this.userHandler.getUser(username);
            if(user){
                if(file && type){
                    const buffer = Buffer.from(file, 'base64');
                    const newImage = {
                      data: buffer,
                      contentType: type,
                    };
                    const update = { $set: { profilePicture: newImage } };
                    const filter = {username: username};
                    const resHandler = this.userHandler.updateUser(filter,update);
                    if(resHandler){
                        return [true,200];
                    } else {
                        return [false,500];
                    }
                } else {
                    return [false,400];
                }
            } else {
                return [false,404];
            }
        } catch (error){
            console.log(error)
            return [false,500];
        }
    }

    async updateRateOfAnAlbum(){

    }

    /**
     * Update the country of a user
     * @param {*} username 
     * @param {*} country 
     * @returns if success of the operation [true,success code] else [false, error code]
     */
    async updateCountry(username,country){
        try {
            const user = await this.userHandler.getUser(username);
            if(user){
                const update = {$set: {'country': country}}
                const filter = {username: username};
                const resUpdate = await this.userHandler.updateUser(filter,update);
                if(resUpdate){
                    return [true,200];
                } else {
                    return [false,500];
                }
            } else {
                return [false,500];
            }
        } catch (error){
            return [false,500];
        }
    }

    /**
     * Update a field of parameters
     * @param {*} username 
     * @param {*} update 
     * @returns if success of the operation [true,success code] else [false, error code]
     */
    async updateParams(username,update){
        try {
            const userParams = await this.userParamsHandler.getUserParams(username);
            if(userParams){
                const filter = {username: username};
                const resUpdate = await this.userParamsHandler.updateUserParams(filter,update);
                if(resUpdate){
                    return [true,200];
                } else {
                    return [false,500];
                }
            } else {
                return [false,404];
            }
        } catch (error){
            return [false,500];
        }
    }

    /**
     * Update the rate of an album for a user
     * @param {*} username 
     * @param {*} albumId 
     * @param {*} rate 
     * @returns if success of the operation [true,success code] else [false, error code]
     */
    async updateRate(username,albumId,rate){
        try {
            const user = await this.userHandler.getUser(username);
            if(user){
                const filter = {username: username,'liked.id': albumId};
                const update = {$set: {'liked.$.rate': rate}};
                const resUpdate = await this.userHandler.updateUser(filter,update);
                if(resUpdate){
                    return [true,200]
                } else {
                    return [false,500]
                }
            } else {
                return [false,404];
            }
        } catch (error){
            return [false,500];
        }
    }
}

module.exports = UserController;
