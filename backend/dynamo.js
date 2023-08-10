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
        messages: []
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


const dbfunctions = {
    createRoomInDatabase,
    addUserToRoom,
    checkIfRoomExists,
    getRoomInfo,
    addMessageToRoom
}

export default dbfunctions
export { createRoomInDatabase, addUserToRoom, checkIfRoomExists, getRoomInfo, addMessageToRoom }
