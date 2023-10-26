const AlbumHandler = require('../handlers/AlbumHandler'); 

class AlbumController {
    constructor(db){
        this.handler = new AlbumHandler(db);
    }
    
}

module.exports = AlbumController;
