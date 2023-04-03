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
                userId: result[0].userid,
                username: result[0].username,
                password: result[0].password,
            }));
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
                        userId: result.insertId,
                        username: username,
                        password: password,
                    }));
                }
            });
        }
    });
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
                    rating: message.rating,
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
    let parentId = req.body.parentid;
    let text = req.body.text;
    let rating = 0;
    connection.query(`INSERT INTO messages 
        (channelid, username, parentid, text, rating) VALUES 
        ('${channelId}', '${username}', '${parentId}', '${text}', '${rating}')`, (error, result) => {
            if (error) {
                console.error(error);
                res.status(400).send(error);
            } else {
                res.status(200).send();
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
                        connection.query(`INSERT INTO users (username, password) VALUES ("sys", "admin")`, (error, result) => {
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
        username varchar(20) NOT NULL,
        parentid int NOT NULL,
        text varchar(280) NOT NULL,
        rating int NOT NULL,
        PRIMARY KEY (messageid)
    )`,
    (error, result) => {
        if (error) {
            console.error(error);
        }
    });

    console.log("Backend server up and running!");
});