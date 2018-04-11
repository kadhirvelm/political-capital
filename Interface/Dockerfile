FROM node:latest

RUN mkdir /interface_docker
COPY . /interface_docker

WORKDIR /interface_docker
ADD . /interface_docker

RUN npm install

EXPOSE 3000
EXPOSE 35729

CMD [ "npm", "start" ]