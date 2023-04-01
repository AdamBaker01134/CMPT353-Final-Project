import React from "react";
import { useParams } from "react-router-dom";

const Messages = (props) => {
    const { channelid, title } = useParams();

    return (
        <>
            <h1>{title}</h1>
            <span>Messages for channel with id: {channelid}</span>
        </>
    )
}

export default Messages;