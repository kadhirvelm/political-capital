FROM node:latest

# Install app dependencies
COPY package.json /interface_docker/package.json
COPY . /interface_docker

WORKDIR /interface_docker

RUN npm install
EXPOSE 3000
CMD [ "npm", "start" ]