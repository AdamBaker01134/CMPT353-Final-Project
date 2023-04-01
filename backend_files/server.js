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
        userid int unsigned NOT NULL,
        parentid int unsigned,
        text varchar(280) NOT NULL,
        PRIMARY KEY (messageid)
    )`,
    (error, result) => {
        if (error) {
            console.error(error);
        }
    });

    console.log("Backend server up and running!");
});