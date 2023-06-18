import React, {useState} from 'react';
import './App.css';
import Chat from './modules/chat/chat';
import Join from './modules/join/join';

function App() {

  const [currentDisplay, setCurrentDisplay] = useState('find-session');
  const [sessionId, setSessionId] = useState('')

  return (
    <div className="App">

      {currentDisplay === "find-session" && <Join setCurrentDisplay={setCurrentDisplay} sessionId={sessionId} setSessionId={setSessionId}/>}
      {/* <Join /> */}
      {currentDisplay === "chatroom" && <Chat sessionId={sessionId}/>}
    </div>
  );
}

export default App;
