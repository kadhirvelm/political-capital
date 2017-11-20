FROM node:latest

RUN mkdir /install
COPY package.json /install/package.json

WORKDIR /install
RUN npm install --verbose

ENV NODE_PATH=/install/node_modules

RUN mkdir /interface_docker
WORKDIR /interface_docker

COPY . /interface_docker/

EXPOSE 3000
CMD [ "npm", "start" ]