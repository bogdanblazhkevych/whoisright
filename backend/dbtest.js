import express from 'express'
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';
import Room from "./room.js"
import User from "./user.js"
import {createRoomInDatabase, addUserToRoom} from './dynamo.js'

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
    let userId = generateCode();
    return {
        userId: userId,
        displayName: displayName
    }
}

io.on('connection', (socket) => { 
    socket.on('join_room', (sessionId) => { //rename join_room to macth the sessionId naming convention
        console.log(sessionId)
        socket.join(sessionId)
    })

    socket.on('generate_code', (displayName) => { //rename generate code aswell as validate code to something more fitting for the naming convention
        //STORIES:
        //As host, init a session with a host user and send session ID to client

        //create a room
        let sessionId = generateCode()
        createRoomInDatabase(sessionId)

        //create a user
        let user = createUser(socket, displayName);

        //add user to room
        addUserToRoom(sessionId, 'host', user)


        //send code to client
        socket.emit('code_generated', sessionId);
    })

    socket.on("validate_code", (sessionId, displayName) => {
        //TODO: handle guest joining
    })

    socket.on('send_message', (messageData) => {
        //TODO: handle sending messages
    })  
})

const port = process.env.PORT || 8000;

app.get('/', function(req, res){
    res.send({connected: true, server: "whoisright backend"})
    // console.log(req)
})

server.listen(port, function() {
    // console.log(`server is running on port ${port}`)
})