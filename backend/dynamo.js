import AWS from 'aws-sdk'
import dotenv from 'dotenv';

dotenv.config();

AWS.config.update({
    region: process.env.AWS_DEFAULT_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

const dynamoClient = new AWS.DynamoDB();

//create a room inside db
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

    dynamoClient.putItem(params, (err, data) => {
        if (err) {
          console.error('Error creating chatroom:', err);
        } else {
          console.log('Chatroom created successfully:', data);
        }
      });
}



//add user to room inside db
const addUserToRoom = async (sessionId, userType, user) => {
    const params = {
        TableName: "chatrooms",
        Key: { "sessionId": { "S": sessionId } },
        UpdateExpression: "SET #users.#userType = :userDetails",
        ExpressionAttributeNames: {
            '#users': 'users',
            '#userType': userType
        },
        ExpressionAttributeValues : {
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

//add user to room
const dbfunctions = {
    createRoomInDatabase,
    addUserToRoom
}

export default dbfunctions
export { createRoomInDatabase, addUserToRoom }
