FROM node:latest

RUN mkdir -p /interface_docker

# Install app dependencies
COPY package.json /interface_docker/package.json
RUN npm install

COPY . /interface_docker

WORKDIR /interface_docker
EXPOSE 3000
CMD [ "npm", "start" ]