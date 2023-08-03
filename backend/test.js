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
    origin: `http://192.168.1.9:3000`,
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
})

const port = process.env.PORT || 8000;

app.get('/', function(req, res){
    res.send({connected: true, server: "whoisright backend"})
    // console.log(req)
})

server.listen(port, function() {
    // console.log(`server is running on port ${port}`)
})