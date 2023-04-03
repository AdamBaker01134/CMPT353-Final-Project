import { React, useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import Message from "./Message";

import "./Channel.css";

const Channel = (props) => {
    const { channelid, title } = useParams();
    const [error, setError] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    useEffect(() => {
        refresh();
    /* Getting an eslint warning for missing dependency, despite the same logic occuring in the Channels component >:( */
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const refresh = () => {
        fetch(`http://localhost:8080/${channelid}/getMessages`, { method: "GET" })
            .then(response => {
                if (response.status !== 200) {
                    setError(true);
                    throw new Error("Error: trouble retrieving messages");
                }
                setError(false);
                return response.json();
            })
            .then(data => setMessages(data))
            .catch(error => console.error(error));
    }

    const addMessage = (messageid, message) => {
        let text = message;
        if (text === "") {
            return;
        } else if (text.includes(`'`)) {
            /* The `'` character messes with the mysql queries */
            text = text.replaceAll(`'`, ``);
        }
        fetch(`http://localhost:8080/${channelid}/addMessage`, {
            method: "POST",
            body: new URLSearchParams({ username: props.user.username, parentid: messageid, text: text }),
            headers: { "Content-type": "application/x-www-form-urlencoded" }
        }).then(response => {
            if (response.status !== 200) {
                alert(`Error: could not add message to ${title}`);
                throw new Error("Error: trouble adding new message");
            }
            refresh();
        }).catch(error => console.error(error));
        setNewMessage("");
    }

    return (
        <>
            <h1>{title}</h1>
            <button onClick={refresh}>Refresh</button>
            {error ?
                <span className="error">We had trouble retrieving the channel messages. Please refresh to try again.</span>
                :
                <>
                    <div>
                        <input id="addPostInput" type="text" placeholder="Create a posting" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}/>
                        <button onClick={(e) => addMessage(-1, newMessage)} id="addPostButton">Create Post</button>
                    </div>
                    {messages.map((message, index) => {
                        let keyValue = `posting-${index}`
                        return (<Message data={message} onPost={addMessage} messageKey={keyValue} level={1} key={keyValue} />);
                    })}
                </>
            }
        </>
    )
}

export default Channel;