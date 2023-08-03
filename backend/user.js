class User {
    constructor (userIsValidated, userSocket, userId, userDisplayName) {
        this.validated = userIsValidated;
        this.socket = userSocket;
        this.userId = userId;
        this.displayName = userDisplayName;
    }
}


export default User