// import logo from './logo.svg';
import { React, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Landing from './components/Landing';
import Login from './components/Login';
import Channels from "./components/Channels";
import Messages from "./components/Messages";

import "./App.css";

function App() {
  const [userInfo, setUserInfo] = useState(null);

  const onLoggedIn = (useId, username, password) => {
    setUserInfo({
      useId: useId,
      username: username,
      password: password,
    });
  }

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route exact path="/" element={<Landing />} />
          <Route path="/login" element={<Login onLoggedIn={onLoggedIn} />} />
          {userInfo !== null &&
            <>
              <Route path="/channels" element={<Channels user={userInfo} /> } />
              <Route path="/channels/:channelid/:title" element={<Messages />} />
            </>
          }
        </Routes>
      </Router>
    </div>
  );
}

export default App;
