class User {
  constructor(username, password, profilePicture, toListen, liked,followed) {
    this.username = username;
    this.password = password;
    this.profilePicture = profilePicture || null;
    this.toListen = toListen || [];
    this.liked = liked || [];
    this.artistFollowed = followed || [];
  }
}

module.exports = User ;
