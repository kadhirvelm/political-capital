eval "$(ssh-agent -s)";
ssh-add "Political-Capital.pem"
chmod 400 "Political-Capital.pem"
ssh -i "Political-Capital.pem" ubuntu@ec2-54-193-47-210.us-west-1.compute.amazonaws.com << EOF
    cd ./political-capital;
    git pull;
    sudo docker rm $(sudo docker ps -a -q);
    sudo docker rmi $(sudo docker images -q);
    sudo docker-compose build server;
    sudo docker-compose up server;
    exit;
EOF