import { React, useState } from "react";

import "./Message.css";

const Message = (props) => {

    const [newReply, setNewReply] = useState("");

    const handleOnKeyUp = (e) => {
        if (e.key === "Enter" || e.keyCode === 13) {
            e.preventDefault();
            props.onPost(props.data.messageid, newReply);
            setNewReply((prevState) => "");
        }
    }

    const handleOnChange = (e) => {
        setNewReply(e.target.value);
    }

    return (
        <div className="message" style={{ marginLeft: props.level * 10 }} aria-level={props.level}>
            <div className="content">
                <b>{props.data.username}:</b>
                <p>{props.data.text}</p>
                <div id="messageInput">
                    <input type="text" placeholder="Reply" onKeyUp={handleOnKeyUp} onChange={handleOnChange} value={newReply} />
                    <b className="ratingButton">+</b>
                    {props.data.rating}
                    <b className="ratingButton">-</b>
                </div>
            </div>
            {props.data.comments.map((comment, index) => {
                let keyValue = `${props.messageKey}-${index}`;
                return (<Message data={comment} onPost={props.onPost} messageKey={keyValue} level={props.level + 1} key={keyValue} />);
            })}
        </div>
    )
}

export default Message;