eval "$(ssh-agent -s)";
ssh-add "Political-Capital.pem"
chmod 400 "Political-Capital.pem"
ssh -i "Political-Capital.pem" ubuntu@ec2-54-193-47-210.us-west-1.compute.amazonaws.com << EOF
    cd ./political-capital;
    git pull;
    cd ./Server;
    sudo docker rm -f $(sudo docker ps -a -q);
    sudo docker rmi -f $(sudo docker images -q);
    sudo docker build . -t political-capital-server:latest;
    sudo docker run political-capital-server:latest;
    exit;
EOF