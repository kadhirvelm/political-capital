var R = require('ramda');
var _ = require('underscore');

var GameManager = require('./GameManager');

class CommonwealthGameManager extends GameManager {
    constructor(io, namespace, roomID, deleteRoom, db, admin, settings){
        super(io, namespace, roomID, deleteRoom, db, admin, settings);
        console.log('Commonwealth Deck Manager Initiated');
    }

    deck1(){
      return [
        {
          flavorText: 'A trader enclave specializing in refined goods requests to open a new trading route to the Commonwealth. The proposed route would first pass through the Frontier before eventually reaching the rest of the states. This resolution would begin the construction process for this new route.',
          Frontier: {yes: {inFavor: 30, against: -10}, no: {inFavor: 15, against: -5}},
          'Port Cities': {yes: {inFavor: 30, against: -10}, no: {inFavor: 15, against: -5}},
          Farmland: {yes: {inFavor: 15, against: -5}, no: {inFavor: 30, against: -10}},
          Mines: {yes: {inFavor: 15, against: -5}, no: {inFavor: 30, against: -10}},
          default: {yes: {inFavor: 0, against: 0}, no: {inFavor: 0, against: 0}}
        },
        {
          flavorText: 'After the partial hull of a ship washed up in a port city laden with foreign goods, a fervor for increased sea exploration has swept the cities. This would slightly increase the tariff on sugar and salt in order to provide subsidies for building sea vessels.',
          Frontier: {yes: {inFavor: Sen, against: -10}, no: {inFavor: 20, against: -20}},
          'Port Cities': {yes: {inFavor: Sen, against: -10}, no: {inFavor: 20, against: -20}},
          Farmland: {yes: {inFavor: 20, against: -20}, no: {inFavor: Sen, against: -10}},
          Mines: {yes: {inFavor: 20, against: -20}, no: {inFavor: Sen, against: -10}},
          default: {yes: {inFavor: 0, against: 0}, no: {inFavor: 0, against: 0}}
        },
        {
          flavorText: 'Great commotion has erupted from the Frontier, a precious metal has been discovered. Currently, only private entities are allowed to mine any mineral in the Commonwealth due to dangerous mining practices by private citizens many, many years ago. In an effort to capitalize on this newly discovered gold, this will repeal the previous resolution and allow private citizens to mine on the Frontier.',
          Frontier: {yes: {inFavor: 10, against: -15}, no: {inFavor: 5, against: -Sen}},
          Mines: {yes: {inFavor: 5, against: -Sen}, no: {inFavor: 10, against: -15}},
          default: {yes: {inFavor: 10, against: -15}, no: {inFavor: 10, against: -15}}
        },
        {
          flavorText: 'A trader enclave specializing in refined goods requests to open a new trading route to the Commonwealth. The proposed route would first pass through the Frontier before eventually reaching the rest of the states. This resolution would begin the construction process for this new route.',
          Frontier: {yes: {inFavor: 0, against: 0}, no: {inFavor: 10, against: -15}},
          'Port Cities': {yes: {inFavor: 5, against: -Sen}, no: {inFavor: 0, against: 0}},
          Farmland: {yes: {inFavor: 0, against: 0}, no: {inFavor: 5, against: -Sen}},
          Mines: {yes: {inFavor: 10, against: -15}, no: {inFavor: 0, against: 0}},
          default: {yes: {inFavor: 0, against: 0}, no: {inFavor: 0, against: 0}}
        },
      ];
    }

    deck2(){
      return [];
    }

    deck3(){
      return [];
    }

    deck4(){
      return [];
    }

    deck5(){
      return [];
    }

    gameResolutionsAndChange(){
        const compiledResolutionDecks = [
          deck1(),
          deck2(),
          deck3(),
          deck4(),
          deck5()
        ];

        this.allResolution = _.flatten(_.sample(compiledResolutionDecks, 2));

        this.allChance = [
          {flavorText: 'All is calm in the Commonwealth.', effect: ['None']},
          {flavorText: 'New campaign funding rules mean more money rolling into your coffers for voter outreach. You can increase your re-election chances if you play your cards right.', effect: ['2x Positives']},
          {flavorText: 'Strength in numbers. The Commonwealth has made a pact with new foreign ally that is lauded by people.', effect: ['Get 20']},
          {flavorText: 'An ambassador\'s remarks on trade set off an international crisis. The Commonwealth\'s influence declines.', effect: ['Lose 20']},
          {flavorText: 'The world is captivated with the Commonwealth boat races. No one is paying attention to the government right now.', effect: ['0.5x Everything']},
          {flavorText: 'A big fight is looming. Your parties will clash in the biggest legislative battle of the term...', effect: ['2x Everything']},
          {flavorText: 'Good news! A new poll released shows your incumbent politicians exceeding expectations and more likely to be reelected', effect: ['Get 10 Senator']},
          {flavorText: 'The latest poll shows your incumbent senators slipping in the race with their opponents. Your fellow senators are starting to think you might be a lost cause.', effect: ['Lose 10 Senator']},
          {flavorText: 'Riots in the streets! It\'s a sluggish economy and voters are outraged at the Commonwealth\'s slow response. Pressure is mounting to pass legislation.', effect: ['2x Negatives']},
          {flavorText: 'Stakes are high! A foreign government has threatened the Commonwealth. Action must be taken, and it must be taken now.', effect: ['2x Everything']},
        ];
    }

    commonwealthAllColors(){
      return ['Mines', 'Port Cities', 'Frontier', 'Farmland'];
    }

    playerNameToParty(playerName){
      return this.commonwealthAllColors()[this.players[playerName].party - 1];
    }

    currentResolutionPayout(resolution, changePlayerName) {
      const finalPayout = resolution[this.playerNameToParty(changePlayerName)] || resolution.default;
      return finalPayout[this.roundWinner];
    }
}

module.exports = CommonwealthGameManager;
