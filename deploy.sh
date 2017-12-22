eval "$(ssh-agent -s)";
ssh-add "Political-Capital.pem"
chmod 400 "Political-Capital.pem"
ssh -i "Political-Capital.pem" ubuntu@ec2-54-193-47-210.us-west-1.compute.amazonaws.com << EOF
    cd ./political-capital;
    git pull;
    cd ./Server;
    sudo docker stop political-capital-server;
    sudo docker build . -t political-capital-server:latest;
    sudo docker run --name=political-capital-server --restart=always -d -p 3000:3000 political-capital-server;
    sudo docker system prune -a -f;
    exit;
EOF