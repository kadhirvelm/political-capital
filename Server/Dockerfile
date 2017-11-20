FROM node:latest

RUN mkdir /server_docker
COPY . /server_docker/
RUN npm install --global nodemon

WORKDIR /server_docker
RUN npm install

EXPOSE 3001
CMD [ "npm", "start" ]