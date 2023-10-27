const ArtistHandler = require('../handlers/ArtistHandler'); 
const Artist = require('../models/Artist'); 
const axios = require('axios');

class ArtistController {
    constructor(db){
        this.handler = new ArtistHandler(db);
    }

    /**
     * Get followers number on Listenerd for a specific artist
     * @param {*} id id of the artist
     * @returns if success of the operation [true,number of followers] else [false, error code]
     */
    async getFollowersOnListenerd(id){
        try {
            const artist = await this.handler.getArtist(id);
            if(artist){
                const numberFollowers = artist.followersListenerd;
                if(numberFollowers){
                    return [true,numberFollowers];
                } else {
                    return [false,404];
                }
            } else {
                return [false,404];
            }
        } catch (error){
            console.log(error);
            return [false,500];
        }
    }

    /**
     * Method allowing to return the 3 first artists picture of the followed list
     * @param {*} list 
     * @returns if success of the operation [true,three first artists picture of the list] else [false, error code]
    */
    async getPicturesList(list){
       try {
           if(list){
               let ret = [];
               if(list.length >= 3){
                  for(let i=0;i<3;i++){
                    let artist = await this.handler.getArtist(list[i]);
                    ret.push(artist.picture);
                  }
               }
               return [true,ret];
           } else {
               return [false,404];
           }
       } catch (error){
           return [false, 500];
       }
    }

    /**
     * Get the artists from the followed list and their recents releases
     * @param {*} list 
     * @param {*} accessTokenSpotify 
     * @returns if success of the operation [true,content of followed list] else [false, error code]
     */
    async getFollowedArtists(list,accessTokenSpotify){
        try {
            let ret = [];
            for(let i=0; i<list.length; i++){
                let artist = await this.handler.getArtist(list[i]);
                let retLength = ret.length;
                await axios.get(`https://api.spotify.com/v1/artists/${list[i]}/albums`, {
                    headers: {
                    Authorization: `Bearer ${accessTokenSpotify}`,
                    },
                }).then((response) => {
                    const albums = response.data.items;
                    let j = 0;
                    while(j < albums.length){
                        let releaseDateFormat = new Date(albums[j].release_date);
                        let todayDate = new Date();
                        //1000 ms in a s, 60s in a m, 60m in an hour and 24 hour in a day 
                        var differentInDays = Math.floor((todayDate - releaseDateFormat) / (1000 * 60 * 60 * 24));;
                        if(differentInDays <= 365){
                            ret.push([albums[j].id,albums[j].name,albums[j].album_type,albums[j].release_date,albums[j].images[0].url,[artist.idArtist, artist.name, artist.picture]])
                        }
                        j = j+1;
                    }
                });
                if(ret.length == retLength){
                    ret.push([null,null,null,null,null,[artist.idArtist, artist.name, artist.picture]])
                }
            }
            //sort by date with the more recent first (LIFO way)
            ret.sort((el1, el2) => {
                const el1d = new Date(el1[3]);
                const el2d = new Date(el2[3]);
                return el2d - el1d;
            });
            return [true,ret];
        } catch (error){
            console.log(error);
            return [false, 500];
        }
    }

    /**
     * Get the name of an artist
     * @param {*} id 
     * @returns if success of the operation [true,name of artist] else [false, error code]
     */
    async getNameOfArtist(id){
        try {
            const artist = await this.handler.getArtist(id);
            if(artist){
                return [true,artist.name];
            } else {
                return [false,404];
            }
        } catch (error){
            return [false,500]
        }
    }

    /**
     * Change the number of followers of an artist
     * @param {*} id 
     * @param {*} name 
     * @param {*} photo 
     * @param {*} followers 
     * @param {*} toFollow 
     * @returns 
     */
    async followingArtist(id,name,photo,followers,toFollow){
        try {
            let artist = await this.handler.getArtist(id);
            if(artist){
                if(artist.picture == null){
                    const filter = {$set:{picture: photo}};
                    await this.handler.updateArtist(id,filter);
                }
            } else {
                const newArtist = new Artist(id,name,photo,followers)
                const resInsert = await this.handler.createArtist(newArtist);
                if(!resInsert){
                    return [false,500];
                }
            }
            if(!artist){
                artist = await this.handler.getArtist(id);
            }

            let newNbOfFollowers = artist.followersListenerd;
            if(toFollow){
                newNbOfFollowers = newNbOfFollowers + 1;
            } else {
                newNbOfFollowers = newNbOfFollowers - 1;
            }
            const update = {$set:{followersListenerd: Number(newNbOfFollowers)}}
            await this.handler.updateArtist(id,update);
            return [true,200]
        } catch (error){
            return [false,500]
        }
    }
    
    /**
     * Add artist to the database
     * @param {*} dataArtist 
     * @returns if success of the operation [true,id of artist] else [false, error code]
     */
    async addArtist(id,name,photo,followers){
        try {
            const artist = await this.handler.getArtist(id)
            if(artist){
                return [true,id]
            } else {
                const artistObject = new Artist(id,name)
                const resInsert = await this.handler.createArtist(artistObject);
                if(resInsert){
                    return [true,id]
                } else {
                    return [false,500];
                }
            }
        } catch (error){
            return [false,500]
        }
    }
}

module.exports = ArtistController;