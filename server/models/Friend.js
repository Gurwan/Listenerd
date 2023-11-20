class Friend {
    constructor(originalUser,friendWith){
        this.originalUser = originalUser; //this user follows and is friend with the friendWith
        this.friendWith = friendWith; //no action from this user, he is followed by the original user
    }
}

module.exports = Friend;