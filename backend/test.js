import express from 'express'
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';
import Room from "./room.js"
import User from "./user.js"

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

function createRoom() {
    let sessionId = generateCode();
    chatRooms[sessionId] = new Room(sessionId); 
    return chatRooms[sessionId]
}

function createUser(socket, displayName) {
    let userId = generateCode();
    let user = new User(true, socket, userId, displayName)
    return user
}

function parseMessageDataToServerMessageNode(messageData) {
    let serverMessageNode = {
        "role": messageData.displayName == "Mediator" ? "assistant" : "user",
        "name": messageData.displayName,
        "content": messageData.message
    }
    return serverMessageNode
}

function parseMessageDataToClientMessageNode(messageData) {
    let clientMessageNode = {...messageData, type: "incomming"}
    return clientMessageNode
}

io.on('connection', (socket) => { 
    socket.on('join_room', (sessionId) => { //rename join_room to macth the sessionId naming convention
        console.log(sessionId)
        socket.join(sessionId)
    })

    socket.on('generate_code', (displayName) => { //rename generate code aswell as validate code to something more fitting for the naming convention
        //create a room
        let room = createRoom();

        //create a user
        let user = createUser(socket, displayName);

        //add user to room
        room.addUser('host', user)
        console.log(user)
        console.log(typeof user)
        //send code to client
        socket.emit('code_generated', room.sessionId); //again, rename to match sessionId naming convention
    })

    socket.on("validate_code", (sessionId, displayName) => {
        //check if chatroom exists

        if (chatRooms[sessionId]) {
            let room = chatRooms[sessionId];

            //check if other party is in room
            if (room.getNumberOfConnectedUsers() == 1) {
                //create new user
                let user = createUser(socket, displayName)

                //add user to room
                room.addUser('guest', user)

                //pass chatroom data to clients
                room.users.host.socket.emit("all_users_validated", room.getClientData('host'))
                room.users.guest.socket.emit("all_users_validated", room.getClientData('guest'))
            }
        }
    })

    socket.on('send_message', (messageData) => {
        //establish room
        let room = chatRooms[messageData.sessionId];

        //create server side message node
        let serverMessageNode = parseMessageDataToServerMessageNode(messageData);

        //create client side message node
        let clientMessageNode = parseMessageDataToClientMessageNode(messageData);

        //send client message node to client
        socket.to(room.sessionId).emit('receive_message', clientMessageNode)

        //send server message node to server
        room.addMessage(serverMessageNode)
        
        //implementing ai mediator
        handleMediatorResponse(room)
    })  
})

async function handleMediatorResponse(room) {
    if (room.messages.length % 3 != 0) {
        return
    }

    getMediatorResponse(room.messages)
    .then((response) => {
        let serverMessageNode = parseMediatorResponseToServerMessageNode(response);
        room.addMessage(serverMessageNode)
        let clientMessageNode = parseMediatorResponseToClientMessageNode(response, room.sessionId);
        room.users.host.socket.to(room.sessionId).emit('receive_message', clientMessageNode)
    })
    .catch((error) => {
        console.log(error)
    })
}

async function getMediatorResponse(messages) {
    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages,
    });

    return completion.data.choices[0].message.content
}

function parseMediatorResponseToServerMessageNode(response) {
    let serverMessageNode = {
        role: "assistant",
        name: "Mediator",
        content: response
    }

    return serverMessageNode
}

function parseMediatorResponseToClientMessageNode(response, sessionId) {
    let clientMessageNode = {
        message: response,
        sessionId: sessionId,
        type: 'mediator',
        userId: 'Mediator',
        displayName: 'Mediator'
    }

    return clientMessageNode
}

const port = process.env.PORT || 8000;

app.get('/', function(req, res){
    res.send({connected: true, server: "whoisright backend"})
    // console.log(req)
})

server.listen(port, function() {
    // console.log(`server is running on port ${port}`)
})