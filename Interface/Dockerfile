FROM node:latest

# Install app dependencies
COPY package.json /interface_docker/package.json
RUN npm install
RUN npm install --global react-scripts

COPY . /interface_docker

WORKDIR /interface_docker
EXPOSE 3000
CMD [ "npm", "start" ]