/**
 * CMPT 353 Final Project Frontend React Application App.js file
 * Name: Adam Baker
 * NSID: adb888
 * Student Number: 11252243
 */

import { React, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import Landing from './Landing';
import Login from './Login';
import Channels from "./Channels";
import Channel from "./Channel";
import Users from "./Users";
import Search from "./Search";

import "./App.css";

function App() {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    /* Check for saved authorization whenever the page loads */
    const storeValue = localStorage.getItem("user");
    if (storeValue !== null) {
      setUserInfo(JSON.parse(storeValue));
    }
  }, []);

  const onLoggedIn = (userid, username, admin) => {
    const userJSON = {
      userid: userid,
      username: username,
      admin: admin,
    };
    setUserInfo(userJSON);
    /* Save authorization in local storage */
    localStorage.setItem("user", JSON.stringify(userJSON))
  }

  const onLoggedOut = () => {
    setUserInfo(null);
    /* Remove saved authorization from local storage */
    localStorage.removeItem("user");
  }

  return (
    <div className="App">
      <Router>
        {userInfo !== null &&
          <Link to="/"><button className="logout" onClick={onLoggedOut}>Logout</button></Link>
        }
        <Routes>
          {userInfo !== null ?
            <>
              <Route exact path="/" element={<Channels user={userInfo} />} />
              <Route path="/channels/:channelid/:title" element={<Channel user={userInfo} />} />
              <Route path="/users" element={<Users user={userInfo} />} />
              <Route path="/search" element={<Search user={userInfo} />} />
            </>
            :
            <>
              <Route exact path="/" element={<Landing />} />
              <Route path="/login" element={<Login onLoggedIn={onLoggedIn} />} />
            </>
          }
        </Routes>
      </Router>
    </div>
  );
}

export default App;
