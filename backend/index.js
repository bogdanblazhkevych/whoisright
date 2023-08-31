import express from 'express'
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import crypto from 'crypto';
import dotenv from 'dotenv';
import getMediatorResponse from './mediator.js';
import Message from './message.js'
import { addRoom, addUser, addMessage } from './controllers/index.js';

dotenv.config();

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
    origin: `http://192.168.1.9:3000`,
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
    })

    socket.on('validate_code', async (sessionId, displayName) => {
        let addUserData = await addUser(socket.id, displayName, 'guest', sessionId);
        io.to(addUserData.target).emit(addUserData.callBack, addUserData.data);
    })

    socket.on('send_message', async (messageData) => {
        let addMessageData = await addMessage(messageData);
        console.log("addMEssageData in io module: ", addMessageData)
        socket.to(addMessageData.target).emit(addMessageData.callback, addMessageData.data)
    })

    // socket.on('send_message', async (messageData) => {
    //     let message = Message.fromClientMessage(messageData)
    //     socket.to(messageData.sessionId).emit('receive_message', message.clientSchema)
    //     try {
    //         await addMessageToRoom(messageData.sessionId, message.serverSchema)
    //         let roomInfo = await getRoomInfo(messageData.sessionId)
    //         handleMediatorResponse(roomInfo)
    //     } catch (err) {
    //         console.log('error in sending message async code')
    //     }
    // })

    //add comment 
    //send to fromt end
    //handle gpt response
    //send to front end

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

const handleMediatorResponse = async (roomInfo) => {
    //decide wether or not mediator should respond
    if (roomInfo.messages.length % 3 != 0) {
        return
    }
    try {
        let response = await getMediatorResponse(roomInfo.messages);
        let message = Message.fromMediatorResponse(response, roomInfo.sessionId)
        await addMessageToRoom(roomInfo.sessionId, message.serverSchema);
        io.to([roomInfo.users.host.userId, roomInfo.users.guest.userId]).emit('receive_message', message.clientSchema)
    } catch (err) {
        console.log("error in handling mediator response", err)
    }
}

//TODO: rename functon. maybe mapRoomInfoToClientSchema
const parseRoomInfoToClientData = (roomInfo) => {
    return {
        sessionId: roomInfo.sessionId,
        ...roomInfo.users
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
        return parseRoomInfoToClientData(rawRoomInfo);
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