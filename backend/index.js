import express from 'express'
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { addRoom, addUser, addMessage, addMediatorResponse } from './controllers/index.js';

dotenv.config();

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
    origin: `http://10.94.73.170:3000`,
      methods: ["GET", "POST", "FETCH"],
    },
});

io.on('connection', (socket) => { 
    socket.on('join_room', (sessionId) => {
        socket.join(sessionId)
    })

    socket.on('generate_code', async (displayName) => {
        socket.userType = "host"
        socket.sessionId = generateCode()
        await addRoom(socket.sessionId, socket.id, displayName, 'host')
        socket.emit('code_generated', socket.sessionId);
        //TODO: return data from addRoom call and send that to the client 
    })

    socket.on('validate_code', async (sessionId, displayName) => {
        socket.userType = "guest"
        socket.sessionId = sessionId
        let addUserData = await addUser(socket.id, displayName, 'guest', sessionId);
        io.to(addUserData.target).emit(addUserData.callBack, addUserData.data);
    })

    socket.on('send_message', async (messageData) => {
        let addMessageData = await addMessage(messageData);
        socket.to(addMessageData.target).emit(addMessageData.callback, addMessageData.data)
        let mediatorResponseData = await addMediatorResponse(messageData.sessionId)
        io.to(mediatorResponseData.target).emit(mediatorResponseData.callback, mediatorResponseData.data)
    })

    socket.on('disconnect', async () => {
        try {
            console.log('disconnect session id: ', socket.sessionId)
            const roomInfo = await getRoomInfo(socket.sessionId);
            if (!roomInfo.users.guest || !roomInfo.users.host) {
                await removeRoomFromDatabase(socket.sessionId)
                console.log(`both users disconnected, room ${socket.sessionId} removed from db`)
            } else {
                await removeUserFromRoom(socket.userType, socket.sessionId)
                console.log(`user type ${socket.userType} removed from room`)
            }
        } catch (err) {
            console.log("go fuck yourself ", err)
        }
    })
})

//user had been removed 
///////////////////////
//target: non-removed user id
//callback: user-removed
//data: removed users name

//room has been removed 
///////////////////////
//target: ''
//callback: ''
//data: ''

//error in removing room or user
///////////////////////
//target: ''
//callback: ''
//data: ''

//TODO: maybe rename function to fit with create... naming consistency
function generateCode() {
    return crypto.randomBytes(3).toString('hex').toUpperCase()
}

const port = process.env.PORT || 8000;

app.get('/', function(req, res){
    res.send({connected: true, server: "whoisright backend"})
    // console.log(req)
})

server.listen(port, function() {
    // console.log(`server is running on port ${port}`)
})