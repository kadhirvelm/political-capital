FROM node:latest

RUN npm install --global nodemon

# Install app dependencies
COPY package.json /server_docker/package.json
COPY . /server_docker

WORKDIR /server_docker

RUN npm install
EXPOSE 3001
CMD [ "npm", "start" ]