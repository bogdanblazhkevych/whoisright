import AWS from 'aws-sdk'
import dotenv from 'dotenv';

dotenv.config();

AWS.config.update({
    region: process.env.AWS_DEFAULT_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

const dynamoClient = new AWS.DynamoDB();

const addRoomToDatabase = async (room) => {
    const params = {
        TableName: "chatrooms",
        Item: AWS.DynamoDB.Converter.marshall(room)
    }
    try {
        const data = await dynamoClient.putItem(params).promise();
        console.log('Chatroom created sucessfully', data)
    } catch (err) {
        console.error('error creating chatroom')
        throw new Error("failed to add room to database")
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
        },
        ReturnValues: "ALL_NEW"
    };
    try {
        const data = await dynamoClient.updateItem(params).promise();
        console.log('add users to room data unmarshaled: ', AWS.DynamoDB.Converter.unmarshall(data.Attributes))
        return AWS.DynamoDB.Converter.unmarshall(data.Attributes)
    } catch (err) {
        console.error('Error adding user to chatroom:', err);
        throw new Error("failed to add user to room")
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
        console.log("error in getRoomInfo function: ", err)
        throw new Error("failed to retrieve room info")
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
        const data = await dynamoClient.updateItem(params).promise();
        console.log('message added to database sucessfully: ', data)
        return true;
    } catch (err) {
        console.log("error at adding message to database: ", err)
        return false;
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

const removeRoomFromDatabase = async (sessionId) => {
    //do something
    const params = {
        TableName: "chatrooms",
        Key: {sessionId : {"S" : sessionId}},
    }
    try {
        await dynamoClient.deleteItem(params).promise();
        console.log(`chatroom ${sessionId} has been deleted`);
        
    } catch (err) {
        console.log("error in removing room from database: ", err)
        
    }
}

const removeUserFromRoom = async (userType, sessionId) => {
    //do something
    const params = {
        TableName: "chatrooms",
        Key: {sessionId : {"S": sessionId}},
        UpdateExpression: "SET #users.#userType = :userDetails",
        ExpressionAttributeNames: {
            '#users': 'users',
            '#userType': userType
        },
        ExpressionAttributeValues: {
            ':userDetails' : {"NULL": true}
        },
        ReturnValues: "ALL_OLD"
    }
    try {
        const data = await dynamoClient.updateItem(params).promise();
        return AWS.DynamoDB.Converter.unmarshall(data.Attributes)
    } catch (err) {
        console.error('Error removing user from room:', err);
    }   
}

function dbfunctions() {
    return Object.freeze({
        addRoomToDatabase,
        addUserToRoom,
        checkIfRoomExists,
        getRoomInfo,
        addMessageToRoom,
        getNumberOfMessages,
        removeUserFromRoom,
        removeRoomFromDatabase
    })
}

const database = dbfunctions();
export default database

export { addRoomToDatabase, addUserToRoom, checkIfRoomExists, getRoomInfo, addMessageToRoom, getNumberOfMessages, removeUserFromRoom, removeRoomFromDatabase }
