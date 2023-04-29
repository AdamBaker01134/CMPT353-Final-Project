/**
 * CMPT 353 Final Project Frontend React Application Message Component
 * Name: Adam Baker
 * NSID: adb888
 * Student Number: 11252243
 */

import { React, useState, useEffect } from "react";

import "./Message.css";

const Message = (props) => {

    const [newReply, setNewReply] = useState("");
    const [rating, setRating] = useState(0);
    const [userRating, setUserRating] = useState(0);

    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleOnKeyUp = (e) => {
        if (e.key === "Enter" || e.keyCode === 13) {
            e.preventDefault();
            props.onPost(props.data.messageid, newReply);
            setNewReply(() => "");
        }
    }

    const handleOnChange = (e) => {
        setNewReply(e.target.value);
    }

    const refresh = () => {
        fetch(`http://localhost:8080/${props.data.channelid}/messages/${props.data.messageid}/getRating?userid=${props.user.userid}`, { method: "GET" })
            .then(response => {
                if (response.status !== 200) {
                    setRating("?");
                    throw new Error("Error: trouble retrieving message rating");
                }
                return response.json();
            })
            .then(data => {
                setRating(data.rating);
                setUserRating(data.userRating);
                props.onRefresh();
            })
            .catch(error => console.error(error));
    }

    const vote = (rate) => {
        if (userRating === rate) {
            vote(0);
            return;
        }
        fetch(`http://localhost:8080/${props.data.channelid}/messages/${props.data.messageid}/vote`, {
            method: "POST",
            body: new URLSearchParams({ userid: props.user.userid, rating: rate }),
            headers: { "Content-type": "application/x-www-form-urlencoded" }
        }).then(response => {
            if (response.status !== 200) {
                setRating("?");
                throw new Error("Error: trouble voting on message");
            }
            refresh();
        }).catch(error => console.error(error));
    }

    const removeMessage = (messageid) => {
        if (window.confirm(`Are you sure you'd like to delete the message? All child messages will also be deleted.`)) {
            fetch(`http://localhost:8080/${props.data.channelid}/messages/removeMessage/${messageid}`, { method: "DELETE" })
                .then(response => {
                    if (response.status !== 200) {
                        alert("Error: error occurred while deleting message and its replies");
                        throw new Error("Error: trouble deleting channel")
                    }
                    alert("Successfully deleted message and replies");
                    refresh();
                }).catch(error => console.error(error));
        }
    }

    return (
        <div className="message" style={{ marginLeft: props.level * 10 }} aria-level={props.level}>
            <div className="content">
                <b>{props.data.username}:</b>
                <p>{props.data.text}</p>
                <div className="inputContainer">
                    <div id="messageInput">
                        <input type="text" placeholder="Reply" onKeyUp={handleOnKeyUp} onChange={handleOnChange} value={newReply} />
                        <b onClick={() => vote(1)} id="upvote" aria-selected={userRating === 1} className="ratingButton">+</b>
                        {rating}
                        <b onClick={() => vote(2)} id="downvote" aria-selected={userRating === 2} className="ratingButton">-</b>
                    </div>
                    {props.user.admin &&
                        <button onClick={(e) => removeMessage(props.data.messageid)}>X</button>
                    }
                </div>
            </div>
            {props.data.comments.map((comment, index) => {
                let keyValue = `${props.messageKey}-${index}`;
                return (<Message data={comment} user={props.user} onPost={props.onPost} onRefresh={props.onRefresh} messageKey={keyValue} level={props.level + 1} key={keyValue} />);
            })}
        </div>
    )
}

export default Message;