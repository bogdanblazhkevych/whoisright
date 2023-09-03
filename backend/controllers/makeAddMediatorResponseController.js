export default function makeAddMediatorResponseController({addMediatorResponseUseCase}) {
    return async function addMediatorResponse(sessionId){
        try {
            let mediatorResponseData = await addMediatorResponseUseCase(sessionId)
            return {
                target: sessionId,
                callback: 'receive_message',
                data: mediatorResponseData
            }
        } catch (err) {
            return {
                target: sessionId,
                callback: 'error',
                data: err.message
            }
        }   
    }
}