import express from 'express'
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import crypto from 'crypto';
import dotenv from 'dotenv';
import {addRoomToDatabase, addUserToRoom, checkIfRoomExists, getRoomInfo, addMessageToRoom} from './dynamo.js'
import { Room } from './room.js'
import { User } from './user.js';
import getMediatorResponse from './mediator.js';
import Message from './message.js'

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

//TODO;
//handle users leaving
//handle cleanup in db

io.on('connection', (socket) => { 
    socket.on('join_room', (sessionId) => {
        socket.join(sessionId)
    })

    socket.on('generate_code', async (displayName) => {
        let sessionId = generateCode()
        let room = new Room(sessionId)
        let user = new User(socket.id, displayName)
        try {
            await addRoomToDatabase(room)
            await addUserToRoom(sessionId, 'host', user)
            socket.userType = "host"
            socket.emit('code_generated', sessionId);
        } catch (err) {
            console.log("error at generating code", err)
        }
    })

    socket.on("validate_code", async (sessionId, displayName) => {
        try {
            let roomStatus = await getRoomStatus(sessionId);
            switch (roomStatus) {
                case "roomValid":
                    let user = new User(socket.id, displayName);
                    await addUserToRoom(sessionId, 'guest', user);
                    const parsedRoomInfo = await getParsedRoomInfo(sessionId)
                    socket.userType = "guest"
                    io.to([parsedRoomInfo.host.userId, parsedRoomInfo.guest.userId]).emit('all_users_validated', parsedRoomInfo)
                    break;
                case "roomFull":
                    socket.emit("joinError", 'Room is full')
                    break;
                case "roomNotFound":
                    socket.emit("joinError", "Room not found")
                    break;
                default:
                    socket.emit("joinError", "unknownError")
            }
        } catch (err) {
            console.log("error at validating code: ", err)
        }
    })

    socket.on('send_message', async (messageData) => {
        let message = new Message(messageData.message, messageData.sessionId, 'incomming', messageData.userId, messageData.displayName, 'user')
        socket.to(messageData.sessionId).emit('receive_message', message.clientSchema())
        try {
            await addMessageToRoom(messageData.sessionId, message.serverSchema())
            let roomInfo = await getRoomInfo(messageData.sessionId)
            handleMediatorResponse(roomInfo)
        } catch (err) {
            console.log('error in sending message async code')
        }
    })  

    socket.on('disconnect', () => {
        console.log('user disconnected', socket.userType)
    })
})

const handleMediatorResponse = async (roomInfo) => {
    //decide wether or not mediator should respond
    if (roomInfo.messages.length % 3 != 0) {
        return
    }
    try {
        let response = await getMediatorResponse(roomInfo.messages);
        let message = new Message(response, roomInfo.sessionId, 'mediator', 'Mediator', 'Mediator', 'assistant')
        await addMessageToRoom(roomInfo.sessionId, message.serverSchema());
        io.to([roomInfo.users.host.userId, roomInfo.users.guest.userId]).emit('receive_message', message.clientSchema())
    } catch (err) {
        console.log("error in handling mediator response", err)
    }
}

//TODO: rename functon. maybe mapRoomInfoToClientSchema
const parseRoomInfoToClientData = (roomInfo) => {
    return {
        sessionId: roomInfo.sessionId,
        host: {
            displayName: roomInfo.users.host.displayName,
            userId: roomInfo.users.host.userId
        },
        guest: {
            displayName: roomInfo.users.guest.displayName,
            userId: roomInfo.users.guest.userId
        }
    }
}

const getRoomStatus = async (sessionId) => {
    const roomInfo = await getRoomInfo(sessionId)
    if (Object.keys(roomInfo).length === 0) {
        return "roomNotFound"
    } else if (roomInfo.users.guest.userId !== null) {
        return "roomFull"
    } else {
        return "roomValid"
    }
}

const getParsedRoomInfo = async (sessionId) => {
    try {
        const rawRoomInfo = await getRoomInfo(sessionId);
        const parsedRoomInfo = parseRoomInfoToClientData(rawRoomInfo);
        return parsedRoomInfo
    } catch (err) {
        console.log("error retreiving and parsing room info: ", err)
    }
}

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