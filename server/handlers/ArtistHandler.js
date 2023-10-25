const Artist = require('../models/artist'); 

class ArtistHandler {
  constructor(db){
    this.artists = db.collection('artists');
  }

  /**
   * Create an artist : can be used to store artist data to after that add it to a followed artists list
   * @param {*} id 
   * @param {*} name 
   * @param {*} picture 
   * @param {*} followers 
   */
  async createArtist(id,name,picture,followers) {
    try {
      const newArtist = new Artist(id,name,picture,followers);
      await this.artists.insertOne(newArtist);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get an artist in the database
   * Can be used to get the number of followers on Listenerd or to print artist information in followed artists list
   * @param {*} idArtist 
   * @returns 
   */
  async getArtist(idArtist){
    try {
      const artist = await this.artists.findOne({ idArtist: data.id });
      return artist;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update an artist in the database
   * This method is used to set/update the picture of an artist + to update the number of followers on Listenerd
   * @param {} id 
   * @param {*} k 
   * @param {*} value 
   */
  async updateArtist(id,k,value){
    try {
      if(k == "picture"){
        await this.artists.updateOne({idArtist:id}, {$set:{picture: value}})
      } else {
        await this.artists.updateOne({idArtist:id}, {$set:{followersListenerd: value}})
      }
    } catch (error) {
      throw error;
    }
  }
}



module.exports = ArtistHandler;
