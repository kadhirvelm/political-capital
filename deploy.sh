eval "$(ssh-agent -s)";
chmod 400 "Political-Capital.pem"
ssh-add "Political-Capital.pem"
ssh -i "Political-Capital.pem" ubuntu@ec2-13-57-247-210.us-west-1.compute.amazonaws.com << EOF
    cd ./political-capital;
    git pull;
    cd ./Server;
    sudo docker stop political-capital-server;
    sudo docker system prune -a -f;
    sudo docker build . -t political-capital-server:latest;
    sudo docker run --name=political-capital-server --restart=always -d -p 80:80 political-capital-server;
    exit;
EOF
