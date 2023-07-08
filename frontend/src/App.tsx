import React, {useState} from 'react';
import './App.css';
import Chat from './modules/chat/chat';
import Join from './modules/join/join';

function App() {
  console.log("retard")

  const [currentDisplay, setCurrentDisplay] = useState('find-session');
  const [sessionId, setSessionId] = useState('');
  const [userId, setUserId] = useState('');

  return (
    <div className="App">

      {currentDisplay === "find-session" && <Join setCurrentDisplay={setCurrentDisplay} sessionId={sessionId} setSessionId={setSessionId} setUserId={setUserId}/>}
      {/* <Join /> */}
      {currentDisplay === "chatroom" && <Chat sessionId={sessionId} userId={userId}/>}
    </div>
  );
}

export default App;
