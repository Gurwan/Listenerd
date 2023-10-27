const AlbumHandler = require('../handlers/AlbumHandler'); 

class AlbumController {
    constructor(db){
        this.handler = new AlbumHandler(db);
    }
    
    /**
     * Method allowing to return the 3 first covers of a list of album
     * @param {*} list 
     * @returns if success of the operation [true,three first cover of the list] else [false, error code]
     */
    async getCoversList(list,liked){
        try {
            if(list){
                let ret = [];
                if(list.length >= 3){
                    for(let i=0;i<3;i++){
                        let album
                        if(liked){
                            album = await this.handler.getAlbum(list[i].id);
                        } else {
                            album = await this.handler.getAlbum(list[i]);
                        }
                        ret.push(album.cover);
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
     * Get albums in a list
     * @param {*} list 
     * @param {*} liked 
     * @param {*} artistController 
     * @returns if success of the operation [true,albums of the list] else [false, error code]
     */
    async getList(list,liked,artistController){
        try {
            if(list){
                let ret = []
                for(let i=0;i<list.length;i++){
                    let album;
                    if(liked){
                        album = await this.handler.getAlbum(list[i].id);
                    } else {
                        album = await this.handler.getAlbum(list[i]);
                    }
                    let resArtistController = await artistController.getNameOfArtist(album.artistId);
                    let artistName = null;
                    if(resArtistController[0]){
                        artistName = resArtistController[1]
                    }
                    if(liked){
                        ret.push([album.idAlbum, album.title, [album.artistId, artistName], album.cover, album.releaseDate, list[i].rate]);
                    } else {
                        ret.push([album.idAlbum, album.title, [album.artistId, artistName], album.cover, album.releaseDate]);
                    }
                }
                return [true,ret];
            } else {
                return [false,400];
            }
        } catch (error){
            console.log(error);
            return [false,500];
        }

    }
}

module.exports = AlbumController;
