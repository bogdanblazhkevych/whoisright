import makeAddRoomUseCase from "./makeAddRoomUseCase.js";
import makeAddUserUseCase from "./makeAddUserUseCase.js";
import database from "../dynamo.js";

const addRoomUseCase = makeAddRoomUseCase({ database });
const addUserUseCase = makeAddUserUseCase({ database });

const useCaseService = Object.freeze({
    addRoomUseCase,
    addUserUseCase
})

export default useCaseService
export { addRoomUseCase, addUserUseCase }