import express from 'express'
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { addRoom, addUser, addMessage, addMediatorResponse, removeUser } from './controllers/index.js';

dotenv.config();

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
    origin: `http://192.168.1.8:3000`,
      methods: ["GET", "POST", "FETCH"],
    },
});

//TODO: 
// - move API keys and secrets from .env to aws secrets manager

io.on('connection', (socket) => { 
    socket.on('join_room', (sessionId) => {
        socket.join(sessionId)
    })

    socket.on('generate_code', async (displayName) => {
        socket.userType = "host"
        socket.sessionId = generateCode()
        let addRoomData = await addRoom(socket.sessionId, socket.id, displayName, 'host')
        io.to(addRoomData.target).emit(addRoomData.callBack, addRoomData.data)
    })

    socket.on('validate_code', async (sessionId, displayName) => {
        socket.userType = "guest"
        socket.sessionId = sessionId
        let addUserData = await addUser(socket.id, displayName, 'guest', sessionId);
        io.to(addUserData.target).emit(addUserData.callBack, addUserData.data);
    })

    socket.on('send_message', async (messageData) => {
        let addMessageData = await addMessage(messageData);
        socket.to(addMessageData.target).emit(addMessageData.callBack, addMessageData.data)
        let mediatorResponseData = await addMediatorResponse(messageData.sessionId)
        io.to(mediatorResponseData.target).emit(mediatorResponseData.callback, mediatorResponseData.data)

    })

    socket.on('disconnect', async () => {
        console.log("someone is trying to disconnect: ", socket.id)
        let removeUserData = await removeUser(socket.sessionId, socket.userType)
        socket.to(removeUserData.target).emit(removeUserData.callBack, removeUserData.data)
    })    
})

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