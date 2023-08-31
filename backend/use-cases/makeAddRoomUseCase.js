import Room from '../room.js'

export default function makeAddRoomUseCase({database}) {
    return async function addRoomUseCase(sessionId) {
        let room = new Room(sessionId);
        await database.addRoomToDatabase(room);
    }
}