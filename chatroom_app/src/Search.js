/**
 * CMPT 353 Final Project Frontend React Application Search Component
 * Name: Adam Baker
 * NSID: adb888
 * Student Number: 11252243
 */

import { React, useState } from 'react';

import "./Search.css";

const COMMANDS = {
    MOST_POSTS: "mostPosts",
    LEAST_POSTS: "leastPosts",
    HIGHEST_RATING: "highestRating",
    LOWEST_RATING: "lowestRating",
}

const Search = (props) => {

    const [search, setSearch] = useState("");
    const [userSearch, setUserSearch] = useState("");
    const [displayed, setDisplayed] = useState({});

    const searchQuery = (e, isUserSearch = false) => {
        setDisplayed({});
        let url = isUserSearch ?
            `http://localhost:8080/search/messages/${userSearch}` :
            `http://localhost:8080/search/messages?query=${search}`;
        fetch(url, {
            method: "GET",
            headers: { "Content-type": "application/x-www-form-urlencoded" }
        }).then(response => {
            if (response.status !== 200) {
                setDisplayed({ type: "empty" });
                throw new Error("Error: trouble searching for messages");
            }
            return response.json();
        }).then(messages => {
            if (messages.length === 0) {
                setDisplayed({ type: "empty" });
            } else {
                setDisplayed({
                    type: "messages",
                    value: messages,
                });
            }
        }).catch(error => console.error(error));
    }
    const handleSearchButtons = (command) => {
        setDisplayed({});
        fetch(`http://localhost:8080/search/users/${command}`, {
            method: "GET",
            headers: { "Content-type": "application/x-www-form-urlencoded" }
        }).then(response => {
            if (response.status !== 200) {
                setDisplayed({ type: "empty" });
                throw new Error("Error: trouble searching for user");
            }
            return response.json();
        }).then(user => {
            if (Object.keys(user).length === 0) {
                setDisplayed({ type: "empty" });
            } else {
                let type = "empty";
                switch (command) {
                    case COMMANDS.MOST_POSTS:
                    case COMMANDS.LEAST_POSTS:
                        type = "Posts";
                        break;
                    case COMMANDS.HIGHEST_RATING:
                    case COMMANDS.LOWEST_RATING:
                        type = "Rating";
                        break;
                    default:
                        break;
                }
                setDisplayed({
                    type: type,
                    value: user,
                });
            }
        }).catch(error => console.error(error));
    }

    return (
        <>
            <h1>Search</h1>
            <div className="searchBox">
                <input
                    placeholder="Search for messages containing a phrase..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)} />
                <button onClick={searchQuery}>Search</button>
            </div>
            <div className="usersearchBox">
                <input
                    placeholder="Search for messages from specific users... "
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)} />
                <button onClick={(e) => searchQuery(e, true)}>Search</button>
            </div>
            <div className="searchButtons">
                <button onClick={() => handleSearchButtons(COMMANDS.MOST_POSTS)}>Most Posts</button>
                <button onClick={() => handleSearchButtons(COMMANDS.LEAST_POSTS)}>Least Posts</button>
                <button onClick={() => handleSearchButtons(COMMANDS.HIGHEST_RATING)}>Highest Rating</button>
                <button onClick={() => handleSearchButtons(COMMANDS.LOWEST_RATING)}>Lowest Rating</button>
            </div>
            {
                displayed.type === "empty" ?
                    <span>No results. Please try again.</span>
                    : displayed.type === "messages" ?
                        displayed.value.map((message, index) =>
                            <div className="messageCard" key={`message-${index}`}>
                                <b>{message.username}</b>
                                <p>Message: {message.text}</p>
                            </div>
                        )
                        : displayed.type === "Posts" || displayed.type === "Rating" ?
                            <div className="userCard">
                                <b>{displayed.value.username}</b>
                                <p>{displayed.type}: {displayed.value.total}</p>
                            </div>
                            : null
            }
        </>
    )
}

export default Search;