class ArtistHandler {
  constructor(db){
    this.artists = db.collection('artists');
  }

  /**
   * Create an artist : can be used to store artist data to after that add it to a followed artists list
   * @param {*} artist
   */
  async createArtist(artist) {
    try {
      await this.artists.insertOne(artist);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get an artist in the database
   * Can be used to get the number of followers on Listenerd or to print artist information in followed artists list
   * @param {*} id 
   * @returns 
   */
  async getArtist(id){
    try {
      const artist = await this.artists.findOne({ idArtist: id });
      return artist;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update an artist in the database
   * This method is used to set/update the picture of an artist + to update the number of followers on Listenerd
   * @param {} id 
   * @param {*} update
   */
  async updateArtist(id,k,value){
    try {
      await this.artists.updateOne({idArtist:id}, update)
    } catch (error) {
      throw error;
    }
  }
}



module.exports = ArtistHandler;
