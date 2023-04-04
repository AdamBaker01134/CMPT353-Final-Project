// import logo from './logo.svg';
import { React, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Landing from './components/Landing';
import Login from './components/Login';
import Channels from "./components/Channels";
import Channel from "./components/Channel";
import Users from "./components/Users";

import "./App.css";

function App() {
  const [userInfo, setUserInfo] = useState(null);

  const onLoggedIn = (userid, username, password, admin) => {
    setUserInfo({
      userid: userid,
      username: username,
      password: password,
      admin: admin,
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
              <Route path="/channels/:channelid/:title" element={<Channel user={userInfo} />} />
              <Route path="/users" element={<Users user={userInfo} />} />
            </>
          }
        </Routes>
      </Router>
    </div>
  );
}

export default App;
