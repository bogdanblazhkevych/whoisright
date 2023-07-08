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
    origin: `http://192.168.1.3:3000`,
      methods: ["GET", "POST", "FETCH"],
    },
});


// ------ chatRooms Schema ------
// chatRooms = {
//     A6B78H: {
//         connectedUsers: 2,
//         userA: {
//             validated: true,
//             socket: "socket object",
//             userID: "556795"
//         },
//         userB: {
//             validated: true,
//             socket: "socket object",
//             userID: "998654"
//         },
//         messages: [
//             {
//                 userId: "998654",
//                 message: "you stole my code"
//             },
//             {
//                 userId: "556795",
//                 message: "you stole it from WDS"
//             }
//         ]
//     }
// }

const chatRooms = {}

function createStringMessageLog(messageLog) {
    return messageLog.map(message => `${message.userId}: ${message.message}`).join(': ');
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

    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{"role": "system", "content": primer}, {role: "user", content: chatString}],
    });

    return completion.data.choices[0].message.content
}
  
io.on('connection', (socket) => {

    socket.on("join_room", (sessionId) => {
        socket.join(sessionId)
    })

    socket.on("send_message", (messageData) => {
        let { message, sessionId, userId } = messageData;
        let messagesContainer = chatRooms[sessionId].messages;
        let updatedMessageData = {message, sessionId, userId, type: "incomming"};

        socket.to(sessionId).emit('receive_message', updatedMessageData);

        let messageNode = {
            userId: userId,
            message: message
        };

        messagesContainer.push(messageNode);
        console.log(messagesContainer);

        if (messagesContainer.length === 2) {
            getVerdict(messagesContainer)
            .then((verdict) => {
                let verdictMessageData = {
                    message: verdict,
                    sessionId: sessionId,
                    type: 'mediator',
                    userId: 'Mediator'
                };

                let userAsocket = chatRooms[sessionId].userA.socket;
                userAsocket.to(sessionId).emit('receive_message', verdictMessageData);
            })
            .catch((error) => {
                console.error(error);
            });
        }
    })

    socket.on("generate_code", () => {
        const code = generateCode();
        const userAID = generateCode();

        chatRooms[code] = {
            connectedUsers: 1,
            userA: {
                validated: true,
                socket: socket,
                userID: userAID
            },
            userB: {
                validated: false,
                socket: null,
                userID: null
            },
            messages: []
        };

        socket.emit('code_generated', code);
    })

    socket.on("validate_code", (code) => {
        if (chatRooms[code]) {

            if (chatRooms[code].connectedUsers === 1) {
                const userBID = generateCode();

                chatRooms[code].connectedUsers = 2;
                chatRooms[code].userB.validated = true;
                chatRooms[code].userB.socket = socket;
                chatRooms[code].userB.userID = userBID;

                if (chatRooms[code].userA.validated && chatRooms[code].userB.validated) {
                    chatRooms[code].userA.socket.emit("all_users_validated", chatRooms[code].userA.userID)
                    chatRooms[code].userB.socket.emit("all_users_validated", chatRooms[code].userB.userID)
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