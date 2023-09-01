import makeAddRoomUseCase from "./makeAddRoomUseCase.js";
import makeAddUserUseCase from "./makeAddUserUseCase.js";
import makeAddMessageUseCase from "./makeAddMessageUseCase.js";
import makeAddMediatorResponseUseCase from "./makeAddMediatorResponseUseCase.js";
import database from "../dynamo.js";
import mediator from "../mediator.js";

const addRoomUseCase = makeAddRoomUseCase({ database });
const addUserUseCase = makeAddUserUseCase({ database });
const addMessageUseCase = makeAddMessageUseCase({ database });
const addMediatorResponseUseCase = makeAddMediatorResponseUseCase({ database, mediator })

const useCaseService = Object.freeze({
    addRoomUseCase,
    addUserUseCase,
    addMessageUseCase,
    addMediatorResponseUseCase
})

export default useCaseService
export { addRoomUseCase, addUserUseCase, addMessageUseCase, addMediatorResponseUseCase }