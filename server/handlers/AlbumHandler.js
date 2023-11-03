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
      return true;
    } catch (error) {
      throw error;
      return false;
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
    const album = await this.albums.findOne({ idAlbum: id });
    return album;
  }
}

module.exports = AlbumHandler;

