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
                await this.userParamsHandler.updateUserParams(filter,update);
                return [true,200];
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
                await this.userHandler.updateUser(filter,update);
                return [true,200]
            } else {
                return [false,404];
            }
        } catch (error){
            return [false,500];
        }
    }

    /**
     * Add album to a list
     * @param {*} username 
     * @param {*} list 
     * @param {*} dataAlbum 
     * @param {*} albumController 
     * @param {*} artistController 
     * @returns if success of the operation [true,code indicating the operation] else [false, error code]
     */
    async addAlbumToList(username,list,dataAlbum,albumController,artistController){
        try {
            const user = await this.userHandler.getUser(username);
            if(user){
                const resAlbumController = await albumController.addAlbum(dataAlbum,artistController);
                if(resAlbumController[0]){
                    if(list == 0){
                      if(user.toListen.includes(dataAlbum[0])){
                          //delete the album of the list
                          const filter = {username:username};
                          const update = {$pull: {toListen: dataAlbum[0]}};
                          const resUpdate = await this.userHandler.updateUser(filter,update);
                          if(resUpdate){
                              return [true,-10]
                          } else {
                              return [false,500]
                          }
                      } else {
                          const filter = {username:username};
                          const update = {$push: {toListen: dataAlbum[0]}};
                          const resUpdate = await this.userHandler.updateUser(filter,update);
                          if(resUpdate){
                              return [true,10]
                          } else {
                              return [false,500]
                          }
                      }
                    } else {
                      if(user.liked.some(album => album.id === dataAlbum[0])){
                        //delete the album of the liked list
                        const filter = {username:username};
                        const update = {$pull: {liked: {id: dataAlbum[0]}}};
                        const resUpdate = await this.userHandler.updateUser(filter,update);
                        if(resUpdate){
                            return [true,-11]
                        } else {
                            return [false,500]
                        }
                      } else {
                        let albumLiked = {id: dataAlbum[0], rate: -1}
                        const filter = {username:username};
                        const update = {$push: {liked: albumLiked}};
                        const resUpdate = await this.userHandler.updateUser(filter,update);
                        if(resUpdate){
                            return [true,11]
                        } else {
                            return [false,500]
                        }
                      }
                    } 
                } else {
                    return [false,500]
                }
            } else {
                return [false,404]
            }
        } catch (error){
            return [false,500]
        }
    }

    /**
     * Follow or unfollow an artist
     * @param {*} username 
     * @param {*} dataArtist 
     * @param {*} artistController 
     * @returns if success of the operation [true,code after the follow/unfollow] else [false, error code]
     */
    async followArtist(username,dataArtist,artistController){
        try  {
            const user = await this.userHandler.getUser(username);
            if(user){
                const filter = {username: username}
                if(user.artistFollowed != null && user.artistFollowed != [] && user.artistFollowed.includes(dataArtist[0])){
                    const resArtistController = await artistController.followingArtist(dataArtist[0],dataArtist[1],dataArtist[2],1,false)
                    if(resArtistController[0]){
                        const update = {$pull: {artistFollowed: dataArtist[0]}}
                        await this.userHandler.updateUser(filter,update)
                        return [true,0];
                    } else {
                        return [false,500]
                    }
                } else {
                    const resArtistController = await artistController.followingArtist(dataArtist[0],dataArtist[1],dataArtist[2],1,true)
                    if(resArtistController[0]){
                        const update = {$push: {artistFollowed: dataArtist[0]}}
                        await this.userHandler.updateUser(filter,update)
                        return [true,1];
                    } else {
                        return [false,500]
                    }
                }
            } else {
                return [false,404]
            }
        } catch (error){
            return [false,500]
        }
    }

    /**
     * Check if a user follow an artist
     * @param {*} username 
     * @param {*} idArtist 
     * @returns if success of the operation [true,1 if the artist is followed else 0] else [false, error code]
     */
    async isFollowed(username,idArtist){
        try {
            const user = await this.userHandler.getUser(username);
            if(user){
                if(user.artistFollowed != null && Array.isArray(user.artistFollowed) && (user.artistFollowed.includes(idArtist))){
                    return [true,1]
                } else {
                    return [true,0]
                }
            } else {
                return [false,400]
            }
        } catch (error){
            return [false,500]
        }
    }

    /**
     * Check if an album is in a list, in none or in both
     * The return code is 0 if in wish list, 1 + rate if in liked list, 2 + rate if in both, -1 if in none
     * @param {*} username 
     * @param {*} albumId 
     * @returns if success of the operation [true,return code] else [false, error code]
     */
    async isInList(username,albumId){
        try {
            const user = await this.userHandler.getUser(username);
            if(user){
                const userParams = await this.userParamsHandler.getUserParams(username);
                if(userParams){
                    let ret = -1;
                    if(user.liked != null && Array.isArray(user.liked) && (user.liked.some(album => album.id === albumId))){
                        ret = {res: 1, rate: user.liked.find(album => album.id === albumId).rate};
                    } 
                    if(user.toListen != null && Array.isArray(user.toListen) && (user.toListen.includes(albumId))){
                        if(ret != -1){
                          ret = {res: 2, rate: user.liked.find(album => album.id === albumId).rate};
                        } else {
                          ret = 0;
                        }
                    } 
                    return [true,[ret,userParams]];
                } else {
                    return [false,404]
                }
            } else {
                return [false,400]
            }
        } catch (error){
            return [false,500]
        }
    }
}

module.exports = UserController;
