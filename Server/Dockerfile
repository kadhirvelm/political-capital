FROM node:latest

RUN mkdir -p /server_docker

RUN npm install --global nodemon

# Install app dependencies
COPY package.json /server_docker/package.json
RUN npm install

COPY . /server_docker

WORKDIR /server_docker
EXPOSE 3001
CMD [ "npm", "start" ]