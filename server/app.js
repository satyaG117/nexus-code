require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose')
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken')

const userRoutes = require('./routes/user-routes');
const projectRoutes = require('./routes/project-routes')
const inviteRoutes = require('./routes/invite-routes')
const SocketUser = require('./socket/models/SocketUser');
const Room = require('./socket/models/Room');
const { sockets, rooms, users } = require('./socket/models/maps');
const Project = require('./models/Project');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: ['http://localhost:5173']
    }
});

const PORT = process.env.PORT || 5000;
const LOCAL_MONGODB_URI = "mongodb://127.0.0.1:27017/";
const DB_NAME = "nexuscodedb";


// middleware to set allowed origin, headers and HTTP methods
// change according to requirements
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE , PUT');

    next();
})

async function main() {
    await mongoose.connect(LOCAL_MONGODB_URI + DB_NAME);
}

// call main function to connnect to mongodb
main()
    .then(data => console.log("Connected to DB"))
    .catch(err => console.log(err));

app.use(express.json());

// delay middleware for testing
app.use((req, res, next) => {
    setTimeout(() => {
        next();
    }, 400);
})

app.get('/test', (req, res, next) => {
    res.status(200).json({ message: 'success' });
})

app.use('/api/users', userRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/invites', inviteRoutes)

// error handler middleware
app.use((err, req, res, next) => {
    console.log(err);
    if (req.headersSent) {
        return next(err);
    }

    res.status(err.code || 500).json({
        message: err.message || 'An internal error occured'
    })
})

// io.use((socket, next)=>{
//     const token = socket.handshake.query.token;
//     // console.log(socket.handshake.query.token)
//     try{
//         const payload = jwt.verify(token, process.env.JWT_KEY);
//         console.log('User : ',payload);
//         next();
//     }catch(err){
//         console.log(err.message);
//     }
// })

io.on('connection', (socket) => {
    console.log(`${socket.id} has connected`);

    socket.on('room-join-req', async (data) => {
        const { token, projectId } = data;
        try {
            if (!token || !projectId) {
                throw new Error('JWT token and Room ID required');
            }

            // extract payload
            const payload = jwt.verify(token, process.env.JWT_KEY);
            // key value pair between socket id and user id
            sockets[socket.id] = payload.userId;
            // check if the request project room is in memory
            let project
            if (!rooms[projectId]) {
                console.log('ROOM NOT IN MEMORY')
                // if not in memory then fetch it and initialize it
                project = await Project.findById(projectId);
                if (!project) {
                    throw new Error('Project with given id does not exist');
                }
                // console.log(project);
                rooms[projectId] = new Room(project, 0, []);
            }

            // console.log('ACTIVE USERS IN ROOM BEFORE ADDING: ', rooms[projectId].activeUsers);

            // add user to the room (validation is done by the fucntion)
            rooms[projectId].addUser(payload.userId);
            // if added to the room then set user object
            users[payload.userId] = new SocketUser(payload.userId, payload.username, payload.email, projectId);

            socket.join(projectId)

            const roomData = { ...rooms[projectId] }
            // console.log('SOCKETS OBJECT : ',sockets);
            // console.log('USERS OBJECT : ',users);
            // console.log('ACTIVE USERS IN ROOM AFTER ADDING: ', rooms[projectId].activeUsers);
            roomData.activeUsers = roomData.activeUsers.map((id) => {
                return users[id];
            })

            socket.emit('room-join-res', {
                success: true,
                roomData: roomData
            })
            console.log(socket.id, ' has joined room ', projectId);

            socket.to(projectId).emit('user-join', { username: payload.username, userId: payload.userId });


        } catch (err) {
            console.log(err);
            socket.emit('room-join-res', {
                success: false,
                error: 'Unable to join room'
            })
            console.log(socket.id, ' failed to join room ', projectId)
        }
    })

    socket.on('room-leave-req', async (data) => {
        // check if the room exists
        try {
            const { projectId } = data;
            if (!rooms[projectId]) return;

            // remove user from room
            rooms[projectId].removeUser(sockets[socket.id]);
            users[sockets[socket.id]].currentRoom = null;
            // leave room
            socket.leave(projectId);
            socket.to(projectId).emit('user-leave', { username: users[sockets[socket.id]].username, userId: users[sockets[socket.id]].userId });
            
            // save on every leave
            await Project.findByIdAndUpdate(projectId, { code: rooms[projectId].project.code });
            // free memory if the last member to leave
            if (rooms[projectId].activeUsers.length === 0) {
                delete rooms[projectId];
            }
            console.log(`${socket.id} has left the room ${projectId}`)

            // console.log(rooms)
        } catch (err) {
            console.log(err);
        }

    })

    socket.on('code-change', async (data) => {
        try {
            const { language, code, projectId } = data;
            if (language != 'html' && language != 'css' && language != 'js') {
                throw new Error('Invalid language')
            }

            if(users[sockets[socket.id]].currentRoom !== projectId){
                throw new Error('Unauthorized to change')
            }

            if (code && projectId) {
                // send it to all sockets in the room except the one who sent it
                socket.to(projectId).emit('code-sync', { language, code });
                // update the project state in memory
                rooms[projectId].project.code[language] = code;
                // increase the change count
                rooms[projectId].changesSinceLastSave += 1;

                // save after every 10 changes
                if (rooms[projectId].changesSinceLastSave == 10) {
                    await Project.findByIdAndUpdate(projectId, { code: rooms[projectId].project.code });
                    // reset after saving
                    rooms[projectId].changesSinceLastSave = 0;
                    // io.to(projectId).emit('successful-save', {message : 'Successfully saved'});
                }

            }
        } catch (err) {
            console.log(err);
        }
    })

    socket.on('disconnect', async () => {
        try {
            // get the user
            const user = users[sockets[socket.id]];
            // if user is in a room
            if (user?.currentRoom) {
                // remove user from that room
                rooms[user.currentRoom].removeUser(user.userId);
                socket.leave(user.currentRoom);
                // tell other clients who left
                socket.to(user.currentRoom).emit('user-leave', { username: user.username, userId: user.userId });
                // save on exit
                await Project.findByIdAndUpdate(user.currentRoom, { code: rooms[user.currentRoom].project.code });
                // graceful exit
                if (rooms[user.currentRoom].activeUsers.length === 0) {
                    delete rooms[user.currentRoom];
                }
            }

            // remove user and socket data
            delete users[sockets[socket.id]];
            delete sockets[socket.id];
            console.log('Sockets : ', sockets)
            console.log('User : ', users)
            console.log(`${socket.id} has disconnected`);
        } catch (err) {
            console.log(err);
        }

    })
})



server.listen(PORT, () => console.log('Server running on PORT : ', PORT));