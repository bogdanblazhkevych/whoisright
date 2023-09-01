import { addRoomUseCase, addUserUseCase, addMessageUseCase, addMediatorResponseUseCase } from "../use-cases/index.js";
import makeAddRoomController from "./makeAddRoomController.js";
import makeAddUserController from "./makeAddUserController.js";
import makeAddMessageController from "./makeAddMessageController.js";
import makeAddMediatorResponseController from "./makeAddMediatorResponseController.js";

const addRoom = makeAddRoomController({ addRoomUseCase, addUserUseCase });
const addUser = makeAddUserController({ addUserUseCase });
const addMessage = makeAddMessageController({ addMessageUseCase });
const addMediatorResponse = makeAddMediatorResponseController({ addMediatorResponseUseCase })

const controllerService = Object.freeze({
    addRoom,
    addUser,
    addMessage,
    addMediatorResponse
})

export default controllerService
export { addRoom, addUser, addMessage, addMediatorResponse }