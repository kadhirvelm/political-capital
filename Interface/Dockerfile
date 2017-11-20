FROM node:latest

RUN mkdir /interface_docker
COPY . /interface_docker

WORKDIR /interface_docker
RUN npm install

EXPOSE 3000
CMD [ "npm", "start" ]