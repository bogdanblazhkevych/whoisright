export default function makeAddUserController({ addUserUseCase }) {
    return async function addUserController(userId, displayName, userType, sessionId) {
        let userAdded = await addUserUseCase(userId, displayName, userType, sessionId);

        if (userAdded.userAdded) {
            return {
                target: [userAdded.data.guest.userId, userAdded.data.host.userId],
                callBack: 'all_users_validated',
                data: userAdded.data
            }
        }
        return {
            target: userId,
            callBack: 'joinError',
            data: userAdded.data
        }
    }
}