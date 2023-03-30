# CMPT 353 Final Project Frontend Dockerfile
# Name: Adam Baker
# NSID: adb888
# Student Number: 11252243

ARG NODE_VERSION=19-alpine3.16

FROM node:${NODE_VERSION}

EXPOSE 3000

# In case we need to attach to the container and use bash
RUN apk update && apk add bash

WORKDIR /usr/src/app/frontend_files/react_app

COPY project_app/src/* ./src/
COPY project_app/src/*.json .

RUN npm install react-router-dom cors

CMD [ "npm", "start" ]