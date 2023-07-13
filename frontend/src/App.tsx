import React, {useState} from 'react';
import './App.css';
import Chat from './modules/chat/chat';
import Join from './modules/join/join';

interface ChatDataInterface {
  sessionId: string,
  role: string,
  host: {
    displayName: string,
    userId: string
  }
  guest: {
    displayName: string,
    userId: string
  }
}

function App() {
  const [currentDisplay, setCurrentDisplay] = useState('find-session');
  const [sessionId, setSessionId] = useState('');
  const [userId, setUserId] = useState('');
  const [chatData, setChatData] = useState<ChatDataInterface>({
    sessionId: 'sessionId',
    role: 'role',
    host: {
      displayName: 'name',
      userId: 'userId'
    },
    guest: {
      displayName: 'name',
      userId: 'userId'
    }
  })

  return (
    <div className="App">

      {currentDisplay === "find-session" && <Join setCurrentDisplay={setCurrentDisplay} sessionId={sessionId} setSessionId={setSessionId} setUserId={setUserId} chatData={chatData} setChatData={setChatData}/>}
      {/* <Join /> */}
      {currentDisplay === "chatroom" && <Chat chatData={chatData}/>}
    </div>
  );
}

export default App;
