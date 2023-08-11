import express from 'express'
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';
import {addRoomToDatabase, addUserToRoom, checkIfRoomExists, getRoomInfo, addMessageToRoom} from './dynamo.js'

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
        let room = createRoom(sessionId)
        try {
            await addRoomToDatabase(room)
    
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

    socket.on('send_message', async (messageData) => {
        //create a server message entity
        let serverMessageNode = createServerMessageNode(messageData);

        //create a client message entity
        let clientMessageNode = createClientMessageNode(messageData);

        //send client message to client
        socket.to(messageData.sessionId).emit('receive_message', clientMessageNode)

        try {
            //send server message to server
            await addMessageToRoom(messageData.sessionId, serverMessageNode)
            let roomInfo = await getRoomInfo(messageData.sessionId)

            //TODO: handle mediator response 
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
        let serverMessageNode = parseMediatorResponseToServerMessageNode(response);
        let clientMessageNode = parseMediatorResponseToClientMessageNode(response, roomInfo.sessionId)
        await addMessageToRoom(roomInfo.sessionId, serverMessageNode);
        io.to([roomInfo.users.host.userId, roomInfo.users.guest.userId]).emit('receive_message', clientMessageNode)
    } catch (err) {
        console.log("error in handling mediator response", err)
    }
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

const createRoom = (sessionId) => {
    return {
        sessionId: sessionId,
        users: {
            'host': {
                userId: null,
                dipslayName: null
            },
            'guest': {
                userId: null,
                displayName: null
            }
        },
        messages: [{
            'role': 'system',
            'content': `You are a conflict mediator. You must analyze these two points of view and 
            come to a definative resolution. You must only use the conversation avalible at hand: do not ask 
            to be provided with aditional context or evidence. You are less of a conflict mediator, more-so te judge, 
            the jury, and executioner. What you say goes and you have the final decision. You must make one that is 
            firm and decisive. You may on ocassion declare no winners, but keep this as a last resort option. If the 
            argument is opinion based, such as which brand is better, you MUST make a decision and side with one 
            of the parties, and you must provide reasoning for your decision. If the arggument is subjective and depends 
            on personal preferance, you must chose a winner. Pick one at randome if you must, but chose a winner. 
            Keep your rulings brief, 15 sentences maximum.`
        }]
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