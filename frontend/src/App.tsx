import React, {useState} from 'react';
import './App.css';
import Chat from './modules/chat/chat';
import Join from './modules/join/join';

interface ChatDataInterface {
  sessionId: string,
  // role: string,
  host: {
    displayName: string,
    userId: string
  }
  guest: {
    displayName: string,
    userId: string
  }
}

type userType = "guest" | "host"
 
function App() {
  const [currentDisplay, setCurrentDisplay] = useState('find-session');
  const [userType, setUserType] = useState<userType>('guest')

  const [chatData, setChatData] = useState<ChatDataInterface>({
    sessionId: 'sessionId',
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

      {currentDisplay === "find-session" && 
      <>
          <Join setCurrentDisplay={setCurrentDisplay} 
                chatData={chatData} 
                setChatData={setChatData}
                setUserType={setUserType}/>
      </>
      }

      {currentDisplay === "chatroom" && 
        <>
          <Chat chatData={chatData}
                userType={userType}/>
        </>
      }
    </div>
  );
}

export default App;
