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
            .then(() => console.log("GOT CHANNELS!"))
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

    return (<>
        <h1>Hello, {props.user.username}!</h1>
        <button onClick={refresh}>Refresh</button>
        {error ?
            <span className="error">We had trouble retrieving the channels. Please refresh to try again</span>
            :
            <div className="container">
                <div className="container-horizontal">
                    <input type="text" id="createChannel" placeholder="New channel title" value={newChannel} onChange={(e) => setNewChannel(e.target.value)} />
                    <button onClick={createChannel}>Create Channel</button>
                </div>
                {channels.map(channel =>
                    <Link to={`/channels/${channel.channelid}/${channel.title}`} key={channel.channelid}>{channel.title}</Link>
                )}
            </div>}
    </>);
}

export default Channels;