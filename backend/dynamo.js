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
            ':userDetails': {
                M: {
                    userId: {"S": user.userId},
                    displayName: {"S": user.displayName}
                }
            }
        }
    };

    try {
        const data = await dynamoClient.updateItem(params).promise();
        console.log('Chatroom updated with guest information:', data);
    } catch (err) {
        console.error('Error updating chatroom:', err);
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

//add user to room
const dbfunctions = {
    createRoomInDatabase,
    addUserToRoom,
    checkIfRoomExists
}

export default dbfunctions
export { createRoomInDatabase, addUserToRoom, checkIfRoomExists }
