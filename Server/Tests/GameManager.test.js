var GameManager = require('../Routes/GameManager');
var sinon = require('sinon');
var _ = require('underscore');

describe('Testing the game manager for the vanilla game', () => {
    let gameManager;

    function mockedRoomSocket(namespace, id){
        this.namespace = namespace;
        this.emit = sinon.stub();
        this.onCommands = {};
        this.id = id || 'SAMPLE ID';

        this.on = (key, ...value) => {
            if (_.isUndefined(this.onCommands[key]) && value.length === 1 && typeof _.head(value) === 'function'){
                this.onCommands[key] = _.head(value);
            } else {
                this.onCommands[key](...value);
            }
        };
        this.join = sinon.stub();
        this.to = (party) => {
            return {
                emit: sinon.stub(),
            };
        };
    };

    beforeAll(() => {
        const io = {
            of: (namespace) => {
                return new mockedRoomSocket(namespace);
            },
        };
        const deleteRoom = sinon.stub();
        const db = {
            collection(collection){
                return {
                    findOne: sinon.stub(),
                    update: sinon.stub(),
                };
            }
        };
        gameManager = new GameManager(io, '/default', 'SAMPLEROOMID', deleteRoom, db, 'ADMIN PLAYER');
    });

    test('Initiates a game correctly', () => {
        expect(gameManager).not.toBeUndefined();
    });

    test('Distributes political capital correctly', () => {
        gameManager.advanceRound();
        const playerOne = new mockedRoomSocket('default', 1);
        const playerTwo = new mockedRoomSocket('default', 2);

        gameManager.roomSocket.on('connection', playerOne);
        gameManager.roomSocket.on('connection', playerTwo);

        playerOne.on('newPlayer', 'PLAYER ONE');
        playerTwo.on('newPlayer', 'PLAYER TWO');

        playerOne.on('playerReady', 'PLAYER ONE', 1);
        playerTwo.on('playerReady', 'PLAYER TWO', 2);
        
        playerOne.on('getInitialPartyName', 1);
        playerTwo.on('getInitialPartyName', 2);
        
        playerOne.on('finalizePartyName', gameManager.parties['1'].partyName);
        playerTwo.on('finalizePartyName', gameManager.parties['2'].partyName);

        gameManager.rounds[1].resolution = {
            flavorText: '',
            yes: {inFavor: 20, against: -5},
            no: {inFavor: 10, against: -25},
        };
        gameManager.rounds[1].chance.effect = 'None';

        playerOne.on('vote', {yes: 4, no: 0});
        playerTwo.on('vote', {yes: 0, no: 3});

        // console.log(gameManager.players);
        expect(gameManager.players['PLAYER ONE'].politicalCapital).toEqual(140);
        expect(gameManager.players['PLAYER TWO'].politicalCapital).toEqual(-15);
        expect(gameManager.currentRound).toEqual(2);

        gameManager.players['PLAYER ONE'].politicalCapital = 150;
        gameManager.players['PLAYER ONE'].senators = 4;
        gameManager.players['PLAYER TWO'].politicalCapital = 150;

        gameManager.rounds[2].resolution = {
            flavorText: '',
            yes: {inFavor: 'Sen', against: '-Sen'},
            no: {inFavor: 'Sen', against: -5},
        };
        gameManager.rounds[2].chance.effect = 'None';

        playerOne.on('vote', {yes: 3, no: 0});
        playerTwo.on('vote', {yes: 0, no: 4});

        expect(gameManager.players['PLAYER ONE'].politicalCapital).toEqual(90);
        expect(gameManager.players['PLAYER ONE'].senators).toEqual(3);
        expect(gameManager.players['PLAYER TWO'].politicalCapital).toEqual(70);
        expect(gameManager.players['PLAYER TWO'].senators).toEqual(4);
    });
});
