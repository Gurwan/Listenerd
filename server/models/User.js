class User {
  constructor(username, password, profilePicture, toListen, liked,followed,country) {
    this.username = username;
    this.password = password;
    this.profilePicture = profilePicture || null;
    this.toListen = toListen || [];
    this.liked = liked || [];
    this.artistFollowed = followed || [];
    this.country = country || 'IE'; //Ireland by default
  }
}

module.exports = User ;
