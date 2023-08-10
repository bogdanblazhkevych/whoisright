import express from 'express'
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';
import {createRoomInDatabase, addUserToRoom, checkIfRoomExists, getRoomInfo, addMessageToRoom} from './dynamo.js'

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
    origin: `http://10.94.73.170:3000`,
      methods: ["GET", "POST", "FETCH"],
    },
});


const chatRooms = {}

function generateCode() {
    return crypto.randomBytes(3).toString('hex').toUpperCase()
}

function createUser(socket, displayName) {
    return {
        userId: socket.id,
        displayName: displayName,
    }
}

io.on('connection', (socket) => { 
    socket.on('join_room', (sessionId) => {
        socket.join(sessionId)
    })

    socket.on('generate_code', async (displayName) => {
        let sessionId = generateCode()
        try {
            //TODO: change createRoomInDatabase into two seperate functions, createRoom, and addUserToRoom
            await createRoomInDatabase(sessionId)
    
            let user = createUser(socket, displayName);
    
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
                //create user
                let user = createUser(socket, displayName);
                //add user to room
                await addUserToRoom(sessionId, 'guest', user);
                //get room info
                const roomInfo = await getRoomInfo(sessionId);
                //get client data
                const clientData = parseRoomInfoToClientData(roomInfo);
                //send client data to client
                io.to([roomInfo.users.host.userId, roomInfo.users.guest.userId]).emit('all_users_validated', clientData)
            }
        } catch (err) {
            console.log("error at validating code: ", err)
        }
    })

    socket.on('send_message', (messageData) => {
        //create a server message entity
        let serverMessageNode = createServerMessageNode(messageData);

        //create a client message entity
        let clientMessageNode = createClientMessageNode(messageData);

        //send client message to client
        socket.to(messageData.sessionId).emit('receive_message', clientMessageNode)

        //send server message to server
        addMessageToRoom(messageData.sessionId, serverMessageNode)


        //TODO: handle mediator response 
    })  
})



const createServerMessageNode = (messageData) => {
    let serverMessageNode = {
        "role": messageData.displayName == "Mediator" ? "assistant" : "user",
        "name": messageData.displayName,
        "content": messageData.message
    }
    return serverMessageNode
}

const createClientMessageNode = (messageData) => {
    let clientMessageNode = {...messageData, type: "incomming"}
    return clientMessageNode
}

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

const port = process.env.PORT || 8000;

app.get('/', function(req, res){
    res.send({connected: true, server: "whoisright backend"})
    // console.log(req)
})

server.listen(port, function() {
    // console.log(`server is running on port ${port}`)
})