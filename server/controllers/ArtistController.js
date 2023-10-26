const ArtistHandler = require('../handlers/ArtistHandler'); 

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
    
}

module.exports = ArtistController;