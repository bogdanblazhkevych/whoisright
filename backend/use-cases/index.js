import makeAddRoomUseCase from "./makeAddRoomUseCase.js";
import makeAddUserUseCase from "./makeAddUserUseCase.js";
import makeAddMessageUseCase from "./makeAddMessageUseCase.js";
import database from "../dynamo.js";

const addRoomUseCase = makeAddRoomUseCase({ database });
const addUserUseCase = makeAddUserUseCase({ database });
const addMessageUseCase = makeAddMessageUseCase({ database });

const useCaseService = Object.freeze({
    addRoomUseCase,
    addUserUseCase,
    addMessageUseCase
})

export default useCaseService
export { addRoomUseCase, addUserUseCase, addMessageUseCase }