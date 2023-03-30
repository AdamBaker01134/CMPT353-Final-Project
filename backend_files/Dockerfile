# CMPT 353 Final Project Backend Dockerfile
# Name: Adam Baker
# NSID: adb888
# Student Number: 11252243

ARG NODE_VERSION=19-alpine3.16

FROM node:${NODE_VERSION}

EXPOSE 8080

# In case we need to attach to the container and use bash
RUN apk update && apk add bash

WORKDIR /usr/src/app/backend_files

COPY server.js .
COPY *.json .

RUN npm install express body-parser cors mysql
RUN npm install -g loadtest

CMD [ "node", "server.js" ]