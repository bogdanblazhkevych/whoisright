import React, {useState} from 'react';
import './App.css';
import Chat from './modules/chat/chat';
import Join from './modules/join/join';

interface ChatDataInterface {
  sessionId: string,
  userId: string,
  recipiantDisplayName: string,
  senderDisplayName: string
}

function App() {
  const [currentDisplay, setCurrentDisplay] = useState('find-session');
  const [sessionId, setSessionId] = useState('');
  const [userId, setUserId] = useState('');

  const [chatData, setChatData] = useState<ChatDataInterface>({
    sessionId: 'sessionId',
    userId: 'userId',
    recipiantDisplayName: 'name',
    senderDisplayName: 'name'
  })

  return (
    <div className="App">

      {currentDisplay === "find-session" && <Join setCurrentDisplay={setCurrentDisplay} sessionId={sessionId} setSessionId={setSessionId} setUserId={setUserId} chatData={chatData} setChatData={setChatData}/>}
      {/* <Join /> */}
      {currentDisplay === "chatroom" && <Chat sessionId={sessionId} userId={userId}/>}
    </div>
  );
}

export default App;
