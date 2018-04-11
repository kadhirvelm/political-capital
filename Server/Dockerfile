FROM node:latest

RUN mkdir /server_docker
COPY . /server_docker/
RUN npm install --global nodemon

RUN npm install pm2 -g

ENV CODECLIMATE_REPO_TOKEN=112bcc20ceaa82677c01e9147e3f51430425778ba961e1f109f4ef1d413c9cec
ENV APP_PORT=80
ENV REACT_APP_DEBUG=false
ENV NODE_ENV=production

WORKDIR /server_docker
ADD . /server_docker

RUN npm install

EXPOSE 80
# CMD [ "pm2", "start", "--no-daemon", "server.js", "--watch" ]
CMD [ "nodemon -L server.js" ]