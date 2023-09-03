export default function makeRemoveUserController({ removeUserUseCase }) {
    return async function removeUserController(sessionId, userType) {
        let removeUserData = await removeUserUseCase(sessionId, userType);
        return {
            target: removeUserData?.remainingUserId ?? '',
            callback: 'user-removed',
            data: removeUserData?.removedUserName ?? ''
        }
    }
}

//user had been removed 
///////////////////////
//target: non-removed user id
//callback: user-removed
//data: removed users name

//room has been removed 
///////////////////////
//target: ''
//callback: ''
//data: ''

//error in removing room or user
///////////////////////
//target: ''
//callback: ''
//data: ''