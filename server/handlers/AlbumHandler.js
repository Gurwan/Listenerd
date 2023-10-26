const Album = require('../models/album'); 

class AlbumHandler {

  constructor(db){
    this.albums = db.collection('albums');
  }

  /**
   * Create an album in the database
   * Useful for add an album to a list
   * @param {Album} album 
   */
  async createAlbum(album){
    try {
      await this.albums.insertOne(album);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get an album from the database
   * Useful for get the profile of user and print preview of lists
   * Also used to manage the lists
   * @param {*} id 
   * @returns 
   */
  async getAlbum(id){
    const album = await this.artists.findOne({ idAlbum: id });
    return album;
  }
}

module.exports = AlbumHandler;

