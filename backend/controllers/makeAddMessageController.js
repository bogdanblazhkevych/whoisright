export default function makeAddMessageController({addMessageUseCase}) {
    return async function addMessageController(messageData) {
        try {
            let addMessageResponse = await addMessageUseCase(messageData);
            return {
                target: addMessageResponse.sessionId,
                callBack: 'receive_message',
                data: addMessageResponse
            }
        } catch (err) {
            return {
                target: addMessageResponse.sessionId,
                callBack: 'error',
                data: err.message ?? 'error adding message'
            }
        }
    }
}