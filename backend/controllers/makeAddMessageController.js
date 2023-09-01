export default function makeAddMessageController({addMessageUseCase}) {
    return async function addMessageController(messageData) {
        let addMessageResponse = await addMessageUseCase(messageData);

        if (addMessageResponse.messageAdded) {
            return {
                target: addMessageResponse.data.sessionId,
                callback: 'receive_message',
                data: addMessageResponse.data
            }
        }

        return {
            target: '',
            callback: '',
            data: ''
        }
        //TODO: do more error handling here and in use case
    }
}