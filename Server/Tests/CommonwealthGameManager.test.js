var Commonwealh = require('../Routes/CommonwealthGameManager');
var sinon = require('sinon');
var _ = require('underscore');

describe('Testing the game manager for the vanilla game', () => {
    let gameManager;

    function MockedRoomSocket(namespace, id){
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
                return new MockedRoomSocket(namespace);
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
        gameManager = new Commonwealh(io, '/default', 'SAMPLEROOMID', deleteRoom, db, 'ADMIN PLAYER');
    });

    test('Initiates a game correctly', () => {
        expect(gameManager).not.toBeUndefined();
    });

    test('Distributes political capital correctly', () => {
        gameManager.advanceRound();
        const playerOne = new MockedRoomSocket('default', 1);
        const playerTwo = new MockedRoomSocket('default', 2);
        const playerThree = new MockedRoomSocket('default', 3);

        gameManager.roomSocket.on('connection', playerOne);
        gameManager.roomSocket.on('connection', playerTwo);
        gameManager.roomSocket.on('connection', playerThree);

        playerOne.on('newPlayer', 'PLAYER ONE');
        playerTwo.on('newPlayer', 'PLAYER TWO');
        playerThree.on('newPlayer', 'PLAYER THREE');

        playerOne.on('playerReady', 'PLAYER ONE', 1);
        playerTwo.on('playerReady', 'PLAYER TWO', 2);
        playerThree.on('playerReady', 'PLAYER THREE', 3);
        
        playerOne.on('getInitialPartyName', 1);
        playerTwo.on('getInitialPartyName', 2);
        playerThree.on('getInitialPartyName', 3);
        
        playerOne.on('finalizePartyName', gameManager.parties['1'].partyName);
        playerTwo.on('finalizePartyName', gameManager.parties['2'].partyName);
        playerThree.on('finalizePartyName', gameManager.parties['3'].partyName);

        gameManager.rounds[1].resolution = {
            flavorText: 'Great commotion has erupted from the Frontier, a precious metal has been discovered. Currently, only private entities are allowed to mine any mineral in the Commonwealth due to dangerous mining practices by private citizens many, many years ago. In an effort to capitalize on this newly discovered gold, this will repeal the previous resolution and allow private citizens to mine on the Frontier.',
            Frontier: {yes: {inFavor: 10, against: -15}, no: {inFavor: 5, against: '-Sen'}},
            'Port Cities': {yes: {inFavor: 5, against: '-Sen'}, no: {inFavor: 10, against: -15}},
            default: {yes: {inFavor: 10, against: -15}, no: {inFavor: 10, against: -15}}
        },
        gameManager.rounds[1].chance.effect = 'None';

        playerOne.on('vote', {yes: 4, no: 0});
        playerTwo.on('vote', {yes: 0, no: 3});
        playerThree.on('vote', {yes: 0, no: 3});

        expect(gameManager.playerNameToParty('PLAYER ONE')).toEqual('Mines');
        expect(gameManager.playerNameToParty('PLAYER TWO')).toEqual('Port Cities');
        expect(gameManager.playerNameToParty('PLAYER THREE')).toEqual('Frontier');
        
        expect(gameManager.players['PLAYER ONE'].politicalCapital).toEqual(0);
        expect(gameManager.players['PLAYER ONE'].senators).toEqual(3);
        expect(gameManager.players['PLAYER TWO'].politicalCapital).toEqual(90);
        expect(gameManager.players['PLAYER TWO'].senators).toEqual(3);
        expect(gameManager.players['PLAYER THREE'].politicalCapital).toEqual(75);
        expect(gameManager.players['PLAYER THREE'].senators).toEqual(3);

        expect(gameManager.currentRound).toEqual(2);

        gameManager.rounds[2].resolution = {
            flavorText: 'Great commotion has erupted from the Frontier, a precious metal has been discovered. Currently, only private entities are allowed to mine any mineral in the Commonwealth due to dangerous mining practices by private citizens many, many years ago. In an effort to capitalize on this newly discovered gold, this will repeal the previous resolution and allow private citizens to mine on the Frontier.',
            Frontier: {yes: {inFavor: 10, against: -15}, no: {inFavor: 5, against: '-Sen'}},
            'Port Cities': {yes: {inFavor: 5, against: '-Sen'}, no: {inFavor: 10, against: -15}},
            default: {yes: {inFavor: 10, against: -15}, no: {inFavor: 10, against: -15}}
        },
        gameManager.rounds[2].chance.effect = 'None';

        playerOne.on('vote', {yes: 0, no: 4});
        playerTwo.on('vote', {yes: 8, no: 0});
        playerThree.on('vote', {yes: 0, no: 3});

        expect(gameManager.playerNameToParty('PLAYER ONE')).toEqual('Mines');
        expect(gameManager.playerNameToParty('PLAYER TWO')).toEqual('Port Cities');
        expect(gameManager.playerNameToParty('PLAYER THREE')).toEqual('Frontier');

        expect(gameManager.players['PLAYER ONE'].politicalCapital).toEqual(-100);
        expect(gameManager.players['PLAYER ONE'].senators).toEqual(2);
        expect(gameManager.players['PLAYER TWO'].politicalCapital).toEqual(70);
        expect(gameManager.players['PLAYER TWO'].senators).toEqual(3);
        expect(gameManager.players['PLAYER THREE'].politicalCapital).toEqual(35);
        expect(gameManager.players['PLAYER THREE'].senators).toEqual(2);

        expect(gameManager.currentRound).toEqual(3);
    });
});
