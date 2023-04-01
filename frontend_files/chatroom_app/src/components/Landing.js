import React from "react";
import { Link } from "react-router-dom";

import "./Landing.css";

const Landing = (props) => {
    return (
        <>
            <header>
                <h1>Channel-Based Chat Tool</h1>
                <Link to="/login"><button>Login</button></Link>
            </header>

            <p>
                Welcome to the Channel-Based Chat Tool, a full-stack application built
                in ReactJS as a usask CMPT 353 Final Project.

                This application allows you to:
            </p>
            <ul>
                <li>Create channels</li>
                <li>View all channels</li>
                <li>Select a channel and to post messages in that channel</li>
                <li>Post replies to existing messages</li>
            </ul>

            <div className="bottom">Built by Adam Baker (NSID: adb888, Student Number: 11252243)</div>
        </>
    )
}

export default Landing;