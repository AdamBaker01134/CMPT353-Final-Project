# CMPT353-Final-Project

Final Project for CMPT 353 - Channel-Based Chat Tool

## Project Description

A chat tool that allows users to:

- create channels
- view all channels
- select a channel and enable user to post messages in that channel
- post replies to existing messages

The UI is implemented in Reactjs and all text data is stored in a mysql database.

Check out this video for a full description of the system: <https://youtu.be/i43Jn3OyRW8>

## Setup (notes to the CMPT 353 markers)

As described in the project specification, the submission will only include the files I have
created/edited. Due to this constraint, anyone that would like to setup and run the system
will need to follow these instructions:

1. Create a base React application using:

    ``` txt
    npx create-react-app "insert_app_name_here"
    ```

2. Move the following into the React application directory:
    - ``docker-compose.yml``
    - ``Dockerfile``
    - ``server.js``
    - ``package.json``

    Doing so should overwrite the ``package.json`` file.

3. Move the remaining `.js` and `.css` files into the React applications `/src` directory.
Doing so should also overwrite the ``App.js``, ``App.css``, ``index.js``, and ``index.css`` files.

## How to run the system

To run the Channel-Based Chat Tool, you need to make sure you have Docker installed and opened
on your system.

Then, you should be able to navigate to the React applications root directory containing the
``docker-compose.yml`` file and run:

``` txt
docker-compose up
```

This will start the system. The initialization will be a little iffy, as the node container
tends to race the MySQL server. You will likely see several errors pop up. Please let this process
complete. I have a restart policy in place to ensure that the node container will eventually start
up once the MySQL server has completed its initialization.

Once that has completed, you can visit <http://localhost:3000> to be greeted by the systems landing
page (or straight to the channels page if you are a user that has already logged in).
