import { addRoomUseCase, addUserUseCase, addMessageUseCase } from "../use-cases/index.js";
import makeAddRoomController from "./makeAddRoomController.js";
import makeAddUserController from "./makeAddUserController.js";
import makeAddMessageController from "./makeAddMessageController.js";

const addRoom = makeAddRoomController({ addRoomUseCase, addUserUseCase })
const addUser = makeAddUserController({ addUserUseCase })
const addMessage = makeAddMessageController({ addMessageUseCase })

const controllerService = Object.freeze({
    addRoom,
    addUser,
    addMessage
})

export default controllerService
export { addRoom, addUser, addMessage }