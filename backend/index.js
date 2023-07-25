import express from 'express'
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';

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
    origin: `http://10.13.1.176:3000`,
      methods: ["GET", "POST", "FETCH"],
    },
});


// ------ chatRooms Schema ------
// chatRooms = {
//     A6B78H: {
//         connectedUsers: 2,
//         host: {
//             validated: true,
//             socket: "socket object",
//             userID: "556795",
//             displayName: 'cody'
//         },
//         guest: {
//             validated: true,
//             socket: "socket object",
//             userID: "998654",
//             displayName: 'randy'
//         },
//         messages: [
//             {
//                 userId: "998654",
//                 displayName: 'randy',
//                 message: "you stole my code"
//             },
//             {
//                 userId: "556795",
//                 displayName: 'cody',
//                 message: "you stole it from WDS"
//             }
//         ]
//     }
// }

const chatRooms = {}

function generateCode() {
    return crypto.randomBytes(3).toString('hex').toUpperCase()
}

function createStringMessageLog(messageLog) {
    return messageLog.map(message => `${message.displayName}: ${message.message}`).join(': ');
}

function createObjectMessageLog(messageLog, primer) {
    let openAiMessagesArray = [{"role": "system", "content": primer}]

    messageLog.forEach((messageNode) => {
        let messageObject = {"role": "user", "name": messageNode.displayName, "content": messageNode.message}
        openAiMessagesArray.push(messageObject)
    })

    return openAiMessagesArray
}   

async function getVerdict(messageLog) {

    const primer = `You are a conflict mediator. You must analyze these two points of view and 
    come to a definative resolution. You must only use the conversation avalible at hand: do not ask 
    to be provided with aditional context or evidence. You are less of a conflict mediator, more-so te judge, 
    the jury, and executioner. What you say goes and you have the final decision. You must make one that is 
    firm and decisive. You may on ocassion declare no winners, but keep this as a last resort option. If the 
    argument is opinion based, such as which brand is better, you MUST make a decision and side with one 
    of the parties, and you must provide reasoning for your decision. If the arggument is subjective and depends 
    on personal preferance, you must chose a winner. Pick one at randome if you must, but chose a winner. 
    Keep your rulings brief, 15 sentences maximum.`

    const chatString = createStringMessageLog(messageLog)
    const messageArray = createObjectMessageLog(messageLog, primer)

    console.log(messageArray)

    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messageArray,
    });

    return completion.data.choices[0].message.content
}
  
io.on('connection', (socket) => {

    socket.on("join_room", (sessionId) => {
        socket.join(sessionId)
    })

    socket.on("send_message", (messageData) => {
        let { message, sessionId, userId, displayName } = messageData;
        let messagesContainer = chatRooms[sessionId].messages;
        let updatedMessageData = {message, sessionId, userId, type: "incomming", displayName};

        socket.to(sessionId).emit('receive_message', updatedMessageData);

        let messageNode = {
            userId: userId,
            message: message,
            displayName: displayName
        };

        messagesContainer.push(messageNode);
        if (messagesContainer.length === 2) {
            getVerdict(messagesContainer)
            .then((verdict) => {
                let verdictMessageData = {
                    message: verdict,
                    sessionId: sessionId,
                    type: 'mediator',
                    userId: 'Mediator',
                    displayName: 'Mediator'
                };

                let hostSocket = chatRooms[sessionId].host.socket;
                hostSocket.to(sessionId).emit('receive_message', verdictMessageData);
            })
            .catch((error) => {
                console.error(error);
            });
        }
    })

    socket.on("generate_code", (displayName) => {
        const code = generateCode();
        const userId = generateCode();

        chatRooms[code] = {
            connectedUsers: 1,
            host: {
                validated: true,
                socket: socket,
                userId: userId,
                displayName: displayName
            },
            guest: {
                validated: false,
                socket: null,
                userId: null,
                displayName: null
            },
            messages: []
        };

        socket.emit('code_generated', code);
    })

    socket.on("validate_code", (code, displayName) => {
        if (chatRooms[code]) {

            if (chatRooms[code].connectedUsers === 1) {
                const userId = generateCode();

                chatRooms[code].connectedUsers = 2;
                chatRooms[code].guest.validated = true;
                chatRooms[code].guest.socket = socket;
                chatRooms[code].guest.userId = userId;
                chatRooms[code].guest.displayName = displayName

                if (chatRooms[code].host.validated && chatRooms[code].guest.validated) {
                    const chatData = {
                        role: 'host',
                        sessionId: code,
                        host: {
                            displayName: chatRooms[code].host.displayName,
                            userId: chatRooms[code].host.userId
                        },
                        guest: {
                            displayName: chatRooms[code].guest.displayName,
                            userId: chatRooms[code].guest.userId
                        }
                    }
                    console.log({...chatData, role: 'host'})
                    chatRooms[code].host.socket.emit("all_users_validated", {...chatData, role: 'host'})
                    chatRooms[code].guest.socket.emit("all_users_validated", {...chatData, role: 'guest'})
                }
            }
        }
    })
});

const port = process.env.PORT || 8000;

app.get('/', function(req, res){
    res.send({connected: true, server: "whoisright backend"})
    console.log(req)
})

server.listen(port, function() {
    console.log(`server is running on port ${port}`)
})