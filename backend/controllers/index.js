import { addRoomUseCase, addUserUseCase } from "../use-cases/index.js";
import makeAddRoomController from "./makeAddRoomController.js";

const addRoom = makeAddRoomController({ addRoomUseCase, addUserUseCase })

const controllerService = Object.freeze({
    addRoom
})

export default addRoom