# CMPT 353 Final Project Dockerfile
# Name: Adam Baker
# NSID: adb888
# Student Number: 11252243

ARG NODE_VERSION=19-alpine3.16

FROM node:${NODE_VERSION}

EXPOSE 3000
EXPOSE 8080

# In case we need to attach to the container and use bash
RUN apk update && apk add bash

WORKDIR /usr/src/app/

COPY src/* ./src/
COPY *.json .
COPY server.js .

RUN npm install express body-parser mysql react-router-dom cors