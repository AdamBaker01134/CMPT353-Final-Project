import { React, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Login.css";

const Login = (props) => {

    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const [createError, setCreateError] = useState(false);

    const login = () => {
        fetch("http://localhost:8080/login", {
            method: "POST",
            body: new URLSearchParams({ username: username, password: password }),
            headers: { "Content-type": "application/x-www-form-urlencoded" }
        }).then(response => {
            if (response.status !== 200) {
                setError(true);
                throw new Error("Error: login unauthorized");
            }
            return response.json();
        }).then(user => {
            props.onLoggedIn(user.userId, user.username, user.password);
            navigate("/");
        }).catch(err => console.error(err));
    }
    const createUser = () => {
        if (username === "" || password === "") {
            setCreateError(true);
        }
        fetch("http://localhost:8080/createUser", {
            method: "POST",
            body: new URLSearchParams({ username: username, password: password }),
            headers: { "Content-type": "application/x-www-form-urlencoded" }
        }).then(response => {
            if (response.status !== 200) {
                setCreateError(true);
                throw new Error("Error: trouble creating new user");
            }
            return response.json();
        }).then(user => {
            props.onLoggedIn(user.userId, user.username, user.password);
            navigate("/");
        }).catch(err => console.error(err));
    }

    return (
        <>
            <h1>Login</h1>
            <div className="loginForm">
                <label htmlFor="username">Username: </label>
                <input type="text"
                    id="username"
                    value={username}
                    onChange={(e) => {
                        setError(false);
                        setCreateError(false);
                        setUsername(e.target.value);
                    }} />
                <label htmlFor="password">Password: </label>
                <input type="password"
                    id="password"
                    value={password}
                    onChange={(e) => {
                        setError(false);
                        setCreateError(false);
                        setPassword(e.target.value);
                    }} />
                <div className="submitButtons">
                    <button onClick={login}>Login</button>
                    <button onClick={createUser}>Create Account</button>
                </div>
                {(error &&
                    <span className="error">
                        Username or password was incorrect. Please try again.
                    </span>) ||
                    (createError &&
                        <span className="error">
                            User already exists. Please try again.
                        </span>
                    )}
            </div>
        </>
    );
}

export default Login;