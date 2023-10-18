class User {
  constructor(username, password, profilePicture, toListen, liked) {
    this.username = username;
    this.password = password;
    this.profilePicture = profilePicture || null;
    this.toListen = toListen || [];
    this.liked = liked || [];
  }
}

module.exports = User ;
