class Artist {
  constructor(idArtist, name, picture, nbFollowers){
    this.idArtist = idArtist;
    this.name = name;
    this.picture = picture || null;
    this.followersListenerd = nbFollowers || 0;
  }
}

module.exports = Artist;
