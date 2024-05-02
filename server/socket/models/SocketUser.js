class SocketUser{
    constructor(userId, username, email, currentRoom=null){
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.currentRoom = currentRoom;
    }
}

module.exports = SocketUser;