FROM node:latest

RUN mkdir /server_docker
COPY . /server_docker/
RUN npm install --global nodemon

RUN npm install pm2 -g

ENV CODECLIMATE_REPO_TOKEN=112bcc20ceaa82677c01e9147e3f51430425778ba961e1f109f4ef1d413c9cec
ENV APP_PORT=3000
ENV REACT_APP_DEBUG=false

WORKDIR /server_docker
RUN npm install

EXPOSE 3000
CMD [ "pm2-docker", "start", "server.js", "--watch" ]