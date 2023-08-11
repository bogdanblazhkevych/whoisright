import AWS from 'aws-sdk'
import dotenv from 'dotenv';

dotenv.config();

AWS.config.update({
    region: process.env.AWS_DEFAULT_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

const dynamoClient = new AWS.DynamoDB();

const createRoomInDatabase = async (sessionId) => {
    const chatRoomDetails = {
        sessionId: sessionId,
        users: {
            'host': {
                userId: null,
                displayName: null
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

    const params = {
        TableName: "chatrooms",
        Item: AWS.DynamoDB.Converter.marshall(chatRoomDetails)
    }

    try {
        const data = await dynamoClient.putItem(params).promise();
        console.log('Chatroom created sucessfully', data)
    } catch (err) {
        console.error('error creating chatroom')
    }

}

const addUserToRoom = async (sessionId, userType, user) => {
    const params = {
        TableName: "chatrooms",
        Key: {"sessionId": {"S": sessionId}},
        UpdateExpression: "SET #users.#userType = :userDetails",
        ExpressionAttributeNames: {
            '#users': 'users',
            '#userType': userType
        },
        ExpressionAttributeValues: {
            ':userDetails': AWS.DynamoDB.Converter.marshall({user}).user
        }
    };

    console.log(AWS.DynamoDB.Converter.marshall({user}).user)

    try {
        const data = await dynamoClient.updateItem(params).promise();
        console.log(`Chatroom updated with ${userType} information:`, data);
    } catch (err) {
        console.error('Error adding user to chatroom:', err);
    }    
}

const checkIfRoomExists = async (sessionId) => {
    const params = {
        TableName: "chatrooms",
        Key: {"sessionId": {"S": sessionId}}
    };

    try {
        const data = await dynamoClient.getItem(params).promise();
        if (data.Item) {
            // console.log(AWS.DynamoDB.Converter.unmarshall(data.Item))
            console.log("sessionId exists")
            return true
        } else {
            console.log("sessionId does not exist")
            return false
        }
    } catch (err) {
        console.log("error in checkIfRoomExists: ", err)
    }
}

const getRoomInfo = async (sessionId) => {
    const params = {
        TableName: 'chatrooms',
        Key: {"sessionId": {"S": sessionId}}
    };

    try {
        const data = await dynamoClient.getItem(params).promise();
        const parsedData = AWS.DynamoDB.Converter.unmarshall(data.Item);
        return parsedData
    } catch (err) {
        console.log("error in getRoomData function: ", err)
    }
}

const addMessageToRoom = async (sessionId, message) => {
    const params = {
        TableName: "chatrooms",
        Key: {"sessionId": {"S": sessionId}},
        UpdateExpression: 'SET #messages = list_append(#messages, :newMessage)',
        ExpressionAttributeNames: {'#messages': "messages"},
        ExpressionAttributeValues: {':newMessage': {"L": [AWS.DynamoDB.Converter.marshall({message}).message]}}
    };
    
    try {
        const data = await dynamoClient.updateItem(params).promise()
        console.log('message added to database sicessfully: ', data)
    } catch (err) {
        console.log("error at adding message to database: ", err)
    }
}

const getNumberOfMessages = async (sessionId) => {
    const params = {
        TableName: "chatrooms",
        Key: {sessionId: {"S": sessionId}},
        ProjectionExpression: 'size(messages)'
    }

    try {
        const data = await dynamoClient.getItem(params).promise();
        const numberOfMessages = data.Item.messages.N;
        console.log(`there are ${numberOfMessages} messages`);
        return numberOfMessages
    } catch (err) {
        console.log('error in getting number of messages: ', err)
    }
}


const dbfunctions = {
    createRoomInDatabase,
    addUserToRoom,
    checkIfRoomExists,
    getRoomInfo,
    addMessageToRoom,
    getNumberOfMessages
}

export default dbfunctions
export { createRoomInDatabase, addUserToRoom, checkIfRoomExists, getRoomInfo, addMessageToRoom, getNumberOfMessages }
