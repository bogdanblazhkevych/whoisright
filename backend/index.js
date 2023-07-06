import express from 'express'
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';
import { checkServerIdentity } from 'tls';

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
    //   origin: "http://localhost:3000",
    origin: "http://192.168.1.9:3000",
      methods: ["GET", "POST", "FETCH"],
    },
});

const chatRooms = {}
  
io.on('connection', (socket) => {

    console.log(`on connection,   ${socket}`)

    socket.on("join_room", (sessionId) => {
        console.log(`joined room ${sessionId}`)
        socket.join(sessionId)
    })

    socket.on("send_message", (messageData) => {
        let updatedMessageData = {...messageData};
        updatedMessageData.type = "incomming"
        socket.to(messageData.sessionId).emit('receive_message', updatedMessageData)
    })

    socket.on("generate_code", () => {
        const code = generateCode();
        chatRooms[code] = {connectedUsers: 1, userAValidated: true, userASocket: socket, userBValidated: false, userBSocket: null};
        socket.emit('code_generated', code);
    })

    socket.on("validate_code", (code) => {
        if (chatRooms[code]) {

            if (chatRooms[code].connectedUsers === 1) {
                chatRooms[code].connectedUsers = 2;
                chatRooms[code].userBValidated = true;
                chatRooms[code].userBSocket = socket;
    
                if (chatRooms[code].userAValidated && chatRooms[code].userBValidated) {
                    chatRooms[code].userASocket.emit("all_users_validated")
                    chatRooms[code].userBSocket.emit("all_users_validated")
                }
            }
        }
    })
});

function generateCode() {
    return crypto.randomBytes(3).toString('hex').toUpperCase()
}

const port = process.env.PORT || 8000;

app.get('/', function(req, res){
    res.send({connected: true, server: "whoisright backend"})
    console.log(req)
})

server.listen(port, function() {
    console.log(`server is running on port ${port}`)
})