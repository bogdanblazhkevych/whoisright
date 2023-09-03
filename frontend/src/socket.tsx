import { io, Socket } from "socket.io-client";

interface ChatDataInterface {
    sessionId: string,
    host: {
      displayName: string,
      userId: string
    }
    guest: {
      displayName: string,
      userId: string
    }
}

interface ServerToClientEvents {
  receive_message: (dataObject: {message: string, sessionId: string, type: string, userId: string, displayName: string}) => void,
  code_generated: (a: string) => void,
  all_users_validated: (chatData: ChatDataInterface) => void,
  joinError: (errorName: string) => void
}

interface ClientToServerEvents {
  send_message: (dataObject: {message: string, sessionId: string, type: string, userId: string, displayName: string}) => void;
  join_room: (sessionId: string) => void;
  generate_code: (displayName: string) => void;
  validate_code: (codeInput: string, displayName: string) => void;
  user_disconnected: (userType: 'host' | 'guest') => void;
}

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(`172.20.10.2:8000`);

export default socket