/**
 * CMPT 353 Final Project Backend server.js file
 * Name: Adam Baker
 * NSID: adb888
 * Student Number: 11252243
 */

"use strict"

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql");

const connection = mysql.createConnection({
    host: "mysql_server",
    user: "root",
    password: "admin",
});

const PORT = 8080;
const app = express();

const ADMIN_USERNAME = "sys";
const ADMIN_PASSWORD = "admin";

connection.connect((error) => {
    if (error) {
        throw error;
    } else {
        console.log("Connected to MySQL server!");
    }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

/* Login to chatroom tool */
app.post("/login", (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    connection.query(`SELECT * FROM users WHERE username = "${username}" AND password = "${password}"`, (error, result) => {
        if (error) {
            console.error(error);
            res.status(400).send(error);
        } else if (result.length === 0) {
            res.status(401).send();
        } else {
            res.status(200).send(JSON.stringify({
                userid: result[0].userid,
                username: result[0].username,
                admin: result[0].userid === 1,
            }));
        }
    });
});

/* Get all users with their ids */
app.get("/users", (req, res) => {
    connection.query(`SELECT * FROM users`, (error, result) => {
        if (error) {
            console.error(error);
            res.status(400).send(error);
        } else {
            let responseJSON = [];
            result.forEach(entry => {
                responseJSON.push({
                    userid: entry.userid,
                    username: entry.username,
                });
            });
            res.status(200).send(JSON.stringify(responseJSON));
        }
    });
});

/* Sign up for the chatroom tool (will not allow duplicate users) */
app.post("/createUser", (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    connection.query(`SELECT * FROM users WHERE username = "${username}" AND password = "${password}"`, (error, result) => {
        if (error) {
            console.error(error);
            res.status(400).send(error);
        } else if (result.length > 0) {
            res.status(409).send();
        } else {
            connection.query(`INSERT INTO users (username, password) VALUES ('${username}', '${password}')`, (error, result) => {
                if (error) {
                    console.error(error);
                    res.status(400).send(error);
                } else {
                    res.status(200).send(JSON.stringify({
                        userid: result.insertId,
                        username: username,
                        password: password,
                        admin: false,
                    }));
                }
            });
        }
    });
});

/* ADMIN PRIVILEDGE: delete user from system */
app.delete("/removeUser/:userid", (req, res) => {
    let userid = req.params.userid;
    if (userid == 1) {
        /* Ensure the admin does not delete itself */
        res.status(400).send();
    } else {
        /* Remove user from "users" table */
        connection.query(`DELETE FROM users WHERE userid='${userid}'`, (error, result) => {
            if (error) {
                console.error(error);
                res.status(400).send(error);
            } else {
                /* Remove users ratings from "ratings" table */
                connection.query(`DELETE FROM ratings WHERE userid='${userid}'`, (error, result) => {
                    if (error) {
                        console.error(error);
                        res.status(400).send(error);
                    } else {
                        res.status(200).send();
                    }
                })
            }
        });
    }
});

/* Retrieve all created channels */
app.get("/getChannels", (req, res) => {
    connection.query(`SELECT * FROM channels`, (error, result) => {
        if (error) {
            console.error(error);
            res.status(400).send(error);
        } else {
            res.status(200).send(JSON.stringify(result));
        }
    });
});

/* Create a channel with a title */
app.post("/addChannel", (req, res) => {
    let title = req.body.title;
    connection.query(`INSERT INTO channels (title) VALUES ('${title}')`, (error, result) => {
        if (error) {
            console.error(error);
            res.status(400).send(error);
        } else {
            res.status(200).send();
        }
    });
});

/* ADMIN PRIVILEDGE: remove a channel from the system */
app.delete("/removeChannel/:channelid", (req, res) => {
    let channelid = req.params.channelid;
    /* Remove channel from "channels" table */
    connection.query(`DELETE FROM channels WHERE channelid='${channelid}'`, (error, result) => {
        if (error) {
            console.error(error);
            res.status(400).send(error)
        } else {
            /* Remove channel from "messages" table */
            connection.query(`DELETE FROM messages WHERE channelid='${channelid}'`, (error, result) => {
                if (error) {
                    console.error(error);
                    res.status(400).send(error);
                } else {
                    /* Remove channel from "ratings" table */
                    connection.query(`DELETE FROM ratings WHERE channelid='${channelid}'`, (error, result) => {
                        if (error) {
                            console.error(error);
                            res.status(400).send(error);
                        } else {
                            res.status(200).send();
                        }
                    });
                }
            });
        }
    });
});

/* Retrieve the messages and their nested replies from a given channel */
app.get("/:channelid/getMessages", (req, res) => {
    let channelid = req.params.channelid;
    connection.query(`SELECT * FROM messages WHERE channelid = "${channelid}"`, (error, results) => {
        if (error) {
            console.error(error);
            res.status(400).send(error);
        } else {
            /* Recursive function to construct a JSON of all messages and their nested comments */
            const constructMessageJSON = (message) => {
                let messageId = message.messageid;
                let comments = results.filter(result => result.parentid === messageId);
                let commentJSON = [];
                comments.forEach(comment => commentJSON.push(constructMessageJSON(comment)));
                return {
                    text: message.text,
                    username: message.username,
                    userid: message.userid,
                    channelid: message.channelid,
                    messageid: message.messageid,
                    comments: commentJSON,
                };
            }
            let messagesJSON = [];
            let parentMessages = results.filter(result => result.parentid === -1);
            parentMessages.forEach(parentMessage => messagesJSON.push(constructMessageJSON(parentMessage)));
            res.status(200).send(JSON.stringify(messagesJSON));
        }
    });
});

/* Post a message (post or reply) to a specifc channel */
app.post("/:channelid/addMessage", (req, res) => {
    let channelId = req.params.channelid;
    let username = req.body.username;
    let userid = req.body.userid;
    let parentId = req.body.parentid;
    let text = req.body.text;
    connection.query(`INSERT INTO messages 
        (channelid, userid, parentid, text, username) VALUES 
        ('${channelId}', '${userid}', '${parentId}', '${text}', '${username}')`, (error, result) => {
        if (error) {
            console.error(error);
            res.status(400).send(error);
        } else {
            res.status(200).send();
        }
    });
});

/* ADMIN PRIVILEDGES: remove a message from the system */
app.delete("/:channelid/messages/removeMessage/:messageid", (req, res) => {
    let channelid = req.params.channelid;
    let messageid = req.params.messageid;

    /* Collect all messages in the channel */
    connection.query(`SELECT * FROM messages WHERE channelid='${channelid}'`, (error, result) => {
        if (error) {
            console.error(error);
            res.status(400).send(error);
        } else {
            let affectedMessages = [parseInt(messageid)];
            const findAffectedMessages = (currentid) => {
                let children = result.filter(entry => entry.parentid == currentid);
                children.forEach(child => {
                    affectedMessages.push(child.messageid);
                    findAffectedMessages(child.messageid);
                });
            }
            findAffectedMessages(messageid);
            let totalDeletions = 0;
            affectedMessages.forEach(affectedid => {
                /* Remove message and all replies to that message from "messages" table */
                connection.query(`DELETE FROM messages WHERE messageid='${affectedid}'`, (error, result) => {
                    if (error) {
                        console.error(error);
                        res.status(400).send(error);
                    } else {
                        /* Remove all affected ratings from "ratings" table */
                        connection.query(`DELETE FROM ratings WHERE messageid='${affectedid}'`, (error, result) => {
                            if (error) {
                                console.error(error);
                                res.status(400).send(error);
                            } else if (++totalDeletions >= affectedMessages.length) {
                                /* Send successful response once all affected messages/rating have been serviced */
                                res.status(200).send();
                            }
                        });
                    }
                });
            });
        }
    });
});

/* Get the rating of a specific message */
app.get("/:channelid/messages/:messageid/getRating", (req, res) => {
    let channelid = req.params.channelid;
    let messageid = req.params.messageid;
    let userid = req.query.userid;
    connection.query(`SELECT * FROM ratings WHERE channelid="${channelid}" AND messageid="${messageid}"`, (error, result) => {
        if (error) {
            console.error(error);
            res.status(400).send(error);
        } else {
            let rating = 0;
            let userRating = 0;
            result.forEach(ratingEntry => {
                if (ratingEntry.rating == 1) {
                    rating++;
                } else if (ratingEntry.rating == 2) {
                    rating--;
                }
                if (ratingEntry.userid == userid) {
                    userRating = ratingEntry.rating;
                }
            });
            res.status(200).send(JSON.stringify({
                rating: rating,
                userRating: userRating,
            }));
        }
    });
});

/* Upvote a message by increasing the message rating by 1 */
app.post("/:channelid/messages/:messageid/vote", (req, res) => {
    let channelid = req.params.channelid;
    let messageid = req.params.messageid;
    let userid = req.body.userid;
    let username = req.body.username;
    let rating = req.body.rating;
    connection.query(`SELECT * FROM ratings WHERE channelid='${channelid}' AND messageid='${messageid}' AND userid='${userid}'`, (error, result) => {
        if (error) {
            console.error(error);
            res.status(400).send(error);
        } else {
            if (result.length > 0) {
                /* If a rating on this message for this user already exists, update it */
                connection.query(`UPDATE ratings SET rating='${rating}' WHERE messageid='${messageid}' AND userid='${userid}'`,
                    (error) => {
                        if (error) {
                            console.error(error);
                            res.status(400).send(error);
                        } else {
                            res.status(200).send();
                        }
                    });
            } else {
                /* If a rating on this message for this user does not exist, create one */
                connection.query(`INSERT INTO ratings (channelid, messageid, userid, username, rating) VALUES ('${channelid}', '${messageid}', '${userid}', '${username}', '${rating}')`,
                    (error) => {
                        if (error) {
                            console.error(error);
                            res.status(400).send(error);
                        } else {
                            res.status(200).send();
                        }
                    });
            }
        }
    });
});

/* Search for messages that contain specific strings */
app.get("/search/messages", (req, res) => {
    let searchQuery = req.query.query;
    connection.query(`SELECT * FROM messages`, (error, result) => {
        if (error) {
            console.error(error);
            res.status(400).send(error);
        } else {
            let responseJSON = [];
            result.forEach(message => {
                if (message.text.includes(searchQuery)) {
                    responseJSON.push({
                        username: message.username,
                        text: message.text,
                    });
                }
            });
            res.status(200).send(JSON.stringify(responseJSON));
        }
    });
});

/* Search for messages from specific users */
app.get("/search/messages/:username", (req, res) => {
    let username = req.params.username;
    connection.query(`SELECT * FROM messages WHERE username='${username}'`, (error, result) => {
        if (error) {
            console.error(error);
            res.status(400).send(error);
        } else {
            let responseJSON = [];
            result.forEach(message => responseJSON.push({
                username: message.username,
                text: message.text,
            }));
            res.status(200).send(JSON.stringify(responseJSON));
        }
    });
});

/* Search for user with the most/least posts or highest/lowest ranking */
app.get("/search/users/:command", (req, res) => {
    let command = req.params.command;
    connection.query(`SELECT * FROM users`, (error, userResult) => {
        if (error) {
            console.error(error);
            res.status(400).send(error);
        } else {
            let usersChecked = 0;
            let totals = {};
            let desiredUser = {};
            userResult.forEach(user => {
                totals[user.userid] = {
                    username: user.username,
                    total: 0,
                };
                connection.query(`SELECT * FROM messages WHERE userid='${user.userid}'`, (error, messageResult) => {
                    if (error) {
                        console.error(error);
                        res.status(400).send(error);
                    }
                    if (command === "mostPosts" || command === "leastPosts") {
                        messageResult.forEach(message => {
                            totals[message.userid].total++;
                        });
                        if (++usersChecked === userResult.length) {
                            /* Checked all users, now need to find the desired user */
                            Object.values(totals).forEach(user => {
                                /* Find the desired user based on the command */
                                if (Object.keys(desiredUser).length === 0) {
                                    desiredUser = user;
                                } else if (command === "mostPosts" && user.total > desiredUser.total) {
                                    desiredUser = user;
                                } else if (command === "leastPosts" && user.total < desiredUser.total) {
                                    desiredUser = user;
                                }
                            })
                            res.status(200).send(JSON.stringify(desiredUser));
                        }
                    } else if (command === "highestRating" || command === "lowestRating") {
                        let messagesChecked = 0;
                        messageResult.forEach(message => {
                            connection.query(`SELECT * FROM ratings WHERE messageid='${message.messageid}'`, (error, ratingResult) => {
                                if (error) {
                                    console.error(error);
                                    res.status(400).send(error);
                                }
                                messagesChecked++;
                                ratingResult.forEach(rating => {
                                    if (rating.rating == 1) {
                                        totals[message.userid].total++;
                                    } else if (rating.rating == 2) {
                                        totals[message.userid].total--;
                                    }
                                });
                                if (messagesChecked === messageResult.length && ++usersChecked === userResult.length) {
                                    /* Checked all users and messages, now need to find the desired user */
                                    Object.values(totals).forEach(user => {
                                        /* Find the desired user based on the command */
                                        if (Object.keys(desiredUser).length === 0) {
                                            desiredUser = user;
                                        } else if (command === "highestRating" && user.total > desiredUser.total) {
                                            desiredUser = user;
                                        } else if (command === "lowestRating" && user.total < desiredUser.total) {
                                            desiredUser = user;
                                        }
                                    });
                                    res.status(200).send(JSON.stringify(desiredUser));
                                }
                            });
                        });
                    } else {
                        res.status(400).send();
                    }
                });
            });
        }
    });
});

app.listen(PORT, () => {
    /* Create "chatroomdb" database if it doesn't already exist */
    connection.query(`CREATE DATABASE IF NOT EXISTS chatroomdb`, (error, result) => {
        if (error) {
            console.error(error);
        }
    });

    /* Set the current database to "chatroomdb" */
    connection.query(`USE chatroomdb`, (error, result) => {
        if (error) {
            console.error(error);
        }
    });

    /* Create "users" table if it doesn't already exist */
    connection.query(`CREATE TABLE IF NOT EXISTS users (
        userid int unsigned NOT NULL auto_increment,
        username varchar(20) NOT NULL,
        password varchar(20) NOT NULL,
        PRIMARY KEY (userid)
    )`,
        (error, result) => {
            if (error) {
                console.error(error);
            } else {
                connection.query(`SELECT * FROM users`, (error, result) => {
                    if (error) {
                        console.error(error);
                    } else {
                        if (result.length === 0) {
                            /* If the table was just initialized, insert a system administrator into the table */
                            console.log("Creating system administrator!");
                            connection.query(`INSERT INTO users (username, password) VALUES ("${ADMIN_USERNAME}", "${ADMIN_PASSWORD}")`, (error, result) => {
                                if (error) {
                                    console.error(error);
                                }
                            });
                        }
                    }
                });
            }
        });

    /* Create the "channels" table if it doesn't already exist */
    connection.query(`CREATE TABLE IF NOT EXISTS channels (
        channelid int unsigned NOT NULL auto_increment,
        title varchar(200) NOT NULL,
        PRIMARY KEY (channelid)
    )`,
        (error, result) => {
            if (error) {
                console.error(error);
            }
        });

    /* Create the "messages" table if it doesn't already exist */
    connection.query(`CREATE TABLE IF NOT EXISTS messages (
        messageid int unsigned NOT NULL auto_increment,
        channelid int unsigned NOT NULL,
        userid int unsigned NOT NULL,
        parentid int NOT NULL,
        text varchar(280) NOT NULL,
        username varchar(20) NOT NULL,
        PRIMARY KEY (messageid)
    )`,
        (error, result) => {
            if (error) {
                console.error(error);
            }
        });

    /* Create the "ratings" table if it doesn't already exist */
    connection.query(`CREATE TABLE IF NOT EXISTS ratings (
        ratingid int unsigned NOT NULL auto_increment,
        channelid int unsigned NOT NULL,
        messageid int unsigned NOT NULL,
        userid int unsigned NOT NULL,
        username varchar(20) NOT NULL,
        rating int unsigned NOT NULL,
        PRIMARY KEY (ratingid)
    )`);

    console.log("Backend server up and running!");
});