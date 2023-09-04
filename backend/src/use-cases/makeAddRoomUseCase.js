import Room from '../entities/room.js'

export default function makeAddRoomUseCase({database}) {
    return async function addRoomUseCase(sessionId) {
        let room = new Room(sessionId);
        try {
            await database.addRoomToDatabase(room);
        } catch (err) {
            throw err
        }
    }
}