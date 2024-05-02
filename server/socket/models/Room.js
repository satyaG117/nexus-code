const mongoose = require("mongoose");

class Room {
    constructor(project, changesSinceLastSave = 0, activeUsers = []) {
        this.project = project;
        this.changesSinceLastSave = changesSinceLastSave;
        this.activeUsers = activeUsers
    }

    addUser(userId){
        const userIdObject = new mongoose.Types.ObjectId(userId);

        const isContributor = this.project.contributors.some(c => c.equals(userIdObject));
        const isAuthor = this.project.author.equals(userIdObject);

        if((isContributor || isAuthor) && this.activeUsers.length <= 3){
            this.activeUsers.push(userId);
        }else{
            throw new Error('Unauthorized to enter room');
        }
    }

    removeUser(userId){
        this.activeUsers = this.activeUsers.filter(member => member !== userId);
    }
}

module.exports = Room;