import express from 'express'
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import crypto from 'crypto'
import { checkServerIdentity } from 'tls';


const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST", "FETCH"],
    },
});

const chatRooms = {}
  
io.on('connection', (socket) => {
    console.log(chatRooms);

    socket.on("join_room", (sessionId) => {
        console.log(sessionId)
        console.log(`joined room${sessionId}`)
        socket.join(sessionId)
    })

    socket.on("send_message", (messageData) => {
        socket.to(messageData.sessionId).emit('receive_message', messageData)
        console.log(messageData.message)
    })

    socket.on("generate_code", () => {
        const code = generateCode();
        chatRooms[code] = {connectedUsers: 1, userAValidated: true, userASocket: socket, userBValidated: false, userBSocket: null};
        socket.emit('code_generated', code);
        console.log(chatRooms[code].connectedUsers)
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