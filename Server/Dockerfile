FROM node:latest

RUN mkdir /install
COPY package.json /install/package.json

WORKDIR /install
RUN npm install --verbose

ENV NODE_PATH=/install/node_modules

RUN mkdir /server_docker
RUN npm install --global nodemon

WORKDIR /server_docker

COPY . /server_docker/

EXPOSE 3001
CMD [ "npm", "start" ]