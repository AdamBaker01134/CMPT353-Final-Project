/**
 * CMPT 353 Final Project Frontend React Application Users Component
 * Name: Adam Baker
 * NSID: adb888
 * Student Number: 11252243
 */

import { React, useState, useEffect } from "react";

const Users = (props) => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        refresh();
    }, []);

    const refresh = () => {
        fetch(`http://localhost:8080/users`, { method: "GET" })
            .then(response => {
                if (response.status !== 200) {
                    throw new Error("Error: trouble retrieving users");
                }
                return response.json();
            })
            .then(data => setUsers(data))
            .catch(error => console.error(error));
    }

    const removeUser = (userid, username) => {
        if (window.confirm(`Are you sure you'd like to remove the user: ${username}?`)) {
            fetch(`http://localhost:8080/removeUser/${userid}`, { method: "DELETE" })
                .then(response => {
                    if (response.status !== 200) {
                        alert("Error: could not remove user");
                        throw new Error("Error: trouble deleting user");
                    }
                    alert(`Successfully removed ${username} from the system`);
                    refresh();
                }).catch(error => console.error(error));
        }
    }

    return (
        <>
            <h1>Users</h1>
            <button onClick={refresh}>Refresh</button>
            {users.map(user =>
                <div key={user.userid} className="container">
                    <span style={props.user.username === user.username ? { color: "blue"} : {}}>{user.username}</span>
                    {props.user.admin &&
                        <button onClick={(e) => removeUser(user.userid, user.username)}>X</button>
                    }
                </div>
            )}
        </>
    )
}

export default Users;