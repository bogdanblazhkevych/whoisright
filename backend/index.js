import express from 'express'
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';
import {addRoomToDatabase, addUserToRoom, checkIfRoomExists, getRoomInfo, addMessageToRoom} from './dynamo.js'
import { Room } from './room.js'
import { User } from './user.js';

dotenv.config();

const configuration = new Configuration({
    apiKey: process.env.API_KEY,
});

const openai = new OpenAIApi(configuration);

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
    origin: `http://172.16.227.137:3000`,
      methods: ["GET", "POST", "FETCH"],
    },
});

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
            socket.emit('code_generated', sessionId);
        } catch (err) {
            console.log("error at generating code", err)
        }
    })

    socket.on("validate_code", async (sessionId, displayName) => {
        try {   
            let roomExists = await checkIfRoomExists(sessionId)
            if (roomExists) {
                let user = new User(socket.id, displayName);
                await addUserToRoom(sessionId, 'guest', user);
                const roomInfo = await getRoomInfo(sessionId);
                const clientData = parseRoomInfoToClientData(roomInfo);
                io.to([roomInfo.users.host.userId, roomInfo.users.guest.userId]).emit('all_users_validated', clientData)
            }
        } catch (err) {
            console.log("error at validating code: ", err)
        }
    })

    socket.on('send_message', async (messageData) => {
        let serverMessage = mapMessageDataToServerSchema(messageData);
        let clientMessage = mapMessageDataToClientSchema(messageData);

        socket.to(messageData.sessionId).emit('receive_message', clientMessage)

        try {
            await addMessageToRoom(messageData.sessionId, serverMessage)
            let roomInfo = await getRoomInfo(messageData.sessionId)

            handleMediatorResponse(roomInfo)
        } catch (err) {
            console.log('error in sending message async code')
        }
    })  
})

async function getMediatorResponse(messages) {
    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages,
    });

    return completion.data.choices[0].message.content
}

const handleMediatorResponse = async (roomInfo) => {
    //decide wether or not mediator should respond
    if (roomInfo.messages.length % 3 != 0) {
        return
    }

    try {
        let response = await getMediatorResponse(roomInfo.messages);
        let serverMessage = mapMediatorResponseToServerSchema(response);
        let clientMessage = mapMediatorResponseToClientSchema(response, roomInfo.sessionId)
        await addMessageToRoom(roomInfo.sessionId, serverMessage);
        io.to([roomInfo.users.host.userId, roomInfo.users.guest.userId]).emit('receive_message', clientMessage)
    } catch (err) {
        console.log("error in handling mediator response", err)
    }
}

//TODO: rename function. maybe mapMediatorResponseToBackendSchema
//TODO: make es6 arrow
const mapMediatorResponseToServerSchema = (response) => {
    let serverMessageNode = {
        role: "assistant",
        name: "Mediator",
        content: response
    }

    return serverMessageNode
}

//TODO: rename function. maybe mapMediatorResponseToClientSchema
const mapMediatorResponseToClientSchema = (response, sessionId) => {
    let clientMessageNode = {
        message: response,
        sessionId: sessionId,
        type: 'mediator',
        userId: 'Mediator',
        displayName: 'Mediator'
    }

    return clientMessageNode
}

//TODO: rename function. maybe mapMessageDataToBackendSchema
const mapMessageDataToServerSchema = (messageData) => {
    return {
        "role": messageData.displayName == "Mediator" ? "assistant" : "user",
        "name": messageData.displayName,
        "content": messageData.message
    }
}

//TODO: rename functon. maybe markMessageAsIncomming
const mapMessageDataToClientSchema = (messageData) => {
    return {...messageData, type: "incomming"}
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