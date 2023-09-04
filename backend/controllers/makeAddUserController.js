export default function makeAddUserController({ addUserUseCase }) {
    return async function addUserController(userId, displayName, userType, sessionId) {
        try {
            let userAdded = await addUserUseCase(userId, displayName, userType, sessionId);
            return {
                target: [userAdded.data.guest.userId, userAdded.data.host.userId],
                callBack: 'all_users_validated',
                data: userAdded.data
            }
        } catch (err) {
            return {
                target: userId,
                callBack: 'joinError',
                data: err.message ?? 'error in joining room'
            }
        }
    }
}