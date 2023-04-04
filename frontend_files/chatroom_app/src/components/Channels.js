import { React, useState, useEffect } from "react";
import { Link } from "react-router-dom";

import "./Channels.css";

const Channels = (props) => {

    const [error, setError] = useState(false);
    const [channels, setChannels] = useState([]);
    const [newChannel, setNewChannel] = useState("");

    useEffect(() => {
        refresh();
    }, []);

    const refresh = () => {
        fetch("http://localhost:8080/getChannels", { method: "GET" })
            .then(response => {
                if (response.status !== 200) {
                    setError(true);
                    throw new Error("Error: trouble retrieving channels");
                }
                setError(false);
                return response.json();
            })
            .then(data => setChannels(data))
            .catch(error => console.error(error));
    }

    const createChannel = () => {
        if (newChannel === "") {
            return;
        } else if (newChannel.includes("#")) {
            alert("Channel name cannot include the hashtag character!");
            setNewChannel("");
            return;
        };
        fetch("http://localhost:8080/addChannel", {
            method: "POST",
            body: new URLSearchParams({ title: newChannel }),
            headers: { "Content-type": "application/x-www-form-urlencoded" }
        }).then(response => {
            if (response.status !== 200) {
                alert("Error: could not create new channel");
                throw new Error("Error: trouble creating new channel");
            }
            refresh();
        }).catch(error => console.error(error));
        setNewChannel("");
    }

    const removeChannel = (channelid, title) => {
        if (window.confirm(`Are you sure you'd like to delete the channel: ${title}?`)) {
            fetch(`http://localhost:8080/removeChannel/${channelid}`, { method: "DELETE" })
                .then(response => {
                    if (response.status !== 200) {
                        alert("Error: could not delete the channel");
                        throw new Error("Error: trouble deleting channel");
                    }
                    alert(`Successfully deleted the channel: ${title}`);
                    refresh();
                }).catch(error => console.error(error));
        }
    }

    return (<>
        <h1>Hello, {props.user.username}!</h1>
        <button onClick={refresh}>Refresh</button>
        {error ?
            <span className="error">We had trouble retrieving the channels. Please refresh to try again.</span>
            :
            <div className="container">
                <div className="container-horizontal">
                    <input type="text" id="createChannel" placeholder="New channel title" value={newChannel} onChange={(e) => setNewChannel(e.target.value)} />
                    <button onClick={createChannel}>Create Channel</button>
                </div>
                {channels.map(channel =>
                    <div key={channel.channelid} className="channelContainer">
                        <Link to={`/channels/${channel.channelid}/${channel.title}`} key={channel.channelid}>{channel.title}</Link>
                        {props.user.admin &&
                            <button onClick={(e) => removeChannel(channel.channelid, channel.title)}>X</button>
                        }
                    </div>
                )}
                <Link to="/users"><button>Users</button></Link>
            </div>}
    </>);
}

export default Channels;