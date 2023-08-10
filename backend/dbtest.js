import express from 'express'
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';
import {createRoomInDatabase, addUserToRoom, checkIfRoomExists} from './dynamo.js'

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
    origin: `http://192.168.1.5:3000`,
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
            await createRoomInDatabase(sessionId)
    
            let user = createUser(socket, displayName);
    
            await addUserToRoom(sessionId, 'host', user)
    
            socket.emit('code_generated', sessionId);
        } catch (err) {
            console.log("error at generating code", err)
        }
    })

    socket.on("validate_code", async (sessionId, displayName) => {
        //TODO: handle guest joining

        //check if given sessionID exists inside db
        try {   
            let roomExists = await checkIfRoomExists(sessionId)
            console.log(roomExists)
        } catch (err) {
            console.log("error at validating code: ", err)
        }
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