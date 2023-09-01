export default function makeAddMediatorResponseController({addMediatorResponseUseCase}) {
    return async function addMediatorResponse(sessionId){
        try {
            let mediatorResponseData = await addMediatorResponseUseCase(sessionId)
            return {
                target: [mediatorResponseData.data.roomData.users.host.userId, mediatorResponseData.data.roomData.users.guest.userId],
                callback: 'receive_message',
                data: mediatorResponseData.data.messageData
            }
            //if we are handling errors in addMediatorResponseUseCase by throwing them, we would handle them here in the catch block, not with checking if messageAdded is true
        } catch (err) {
            console.log("error in addMediatorResponse controller: ", err)
            return {
                target: '',
                callback: '',
                data: ''
            }
            //TODO: send client back errors  
        }   
    }
}