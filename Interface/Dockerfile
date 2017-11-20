FROM node:latest

RUN mkdir -p /usr/src/app
ADD . /usr/src/app

WORKDIR /usr/src/app
RUN npm install
RUN npm install --only=dev

EXPOSE 3000
CMD [ "npm", "start" ]