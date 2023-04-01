// import logo from './logo.svg';
import { React, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Landing from './components/Landing';
import Login from './components/Login';
import Channels from "./components/Channels";

import "./App.css";

function App() {
  const [ userInfo, setUserInfo ] = useState(null);

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
          <Route exact path="/" element={userInfo === null ? <Landing /> : <Channels user={userInfo} />} />
          <Route path="/login" element={<Login onLoggedIn={onLoggedIn} />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
