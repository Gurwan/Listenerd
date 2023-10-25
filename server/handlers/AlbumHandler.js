const Album = require('../models/album'); 

class AlbumHandler {
  constructor(db){
    this.albums = db.collection('albums');
  }
}

module.exports = AlbumHandler;

