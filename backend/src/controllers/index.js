import { addRoomUseCase, addUserUseCase, addMessageUseCase, addMediatorResponseUseCase, removeUserUseCase } from "../use-cases/index.js";
import makeAddRoomController from "./makeAddRoomController.js";
import makeAddUserController from "./makeAddUserController.js";
import makeAddMessageController from "./makeAddMessageController.js";
import makeAddMediatorResponseController from "./makeAddMediatorResponseController.js";
import makeRemoveUserController from "./makeRemoveUserController.js";

const addRoom = makeAddRoomController({ addRoomUseCase, addUserUseCase });
const addUser = makeAddUserController({ addUserUseCase });
const addMessage = makeAddMessageController({ addMessageUseCase });
const addMediatorResponse = makeAddMediatorResponseController({ addMediatorResponseUseCase });
const removeUser = makeRemoveUserController({ removeUserUseCase });

const controllerService = Object.freeze({
    addRoom,
    addUser,
    addMessage,
    addMediatorResponse,
    removeUser
})

export default controllerService
export { addRoom, addUser, addMessage, addMediatorResponse, removeUser }