var R = require('ramda');
var _ = require('underscore');

const GameManager = require('./GameManager');

class CommonwealthGameManager extends GameManager {
    constructor(io, namespace, roomID, deleteRoom, db, admin, settings){
        super(io, namespace, roomID, deleteRoom, db, admin, settings)
        console.log('Commonwealth Deck Manager Initiated')
    }

    gameResolutionsAndChange(){
        this.allResolution = [
          {
            flavorText: 'A trader enclave requests to open a new trading route to the commonwealth. The proposed route would first pass through the Frontier before eventually reaching the rest of the states. This resolution would begin the construction process for this new route.',
            Mines: { yes: { inFavor: 25, against: -25 }, no: { inFavor: 'Sen', against: -25 } },
            default: { yes: { inFavor: 10, against: -20 }, no: { inFavor: 5, against: -5 } }
          },
          {
            flavorText: 'A well-known wildlife researcher has concluded that a widely hunted bird, commonly traded for its rich and colorful feathers will near critical levels soon. Based on the scientist\'s findings, this will create an air pollution regulatory commitee to help mitigate the negative effects plaguging the bird\'s nesting grounds.',
            Mines: { yes: { inFavor: 25, against: -25 }, no: { inFavor: 'Sen', against: -25 } },
            default: { yes: { inFavor: 10, against: -20 }, no: { inFavor: 5, against: -5 } }
          },
        ]
    }

    commonwealthAllColors(){
      return [ 'Mines', 'Port Cities', 'Frontier', 'Farmland' ]
    }

    playerNameToParty(playerName){
      return this.commonwealthAllColors()[this.players[playerName].party - 1]
    }

    currentResolutionPayout(resolution, changePlayerName) {
      const finalPayout = resolution[this.playerNameToParty(changePlayerName)] || resolution.default
      console.log(this.playerNameToParty(changePlayerName), _.keys(resolution))
      return finalPayout[this.roundWinner]
    }
}

module.exports = CommonwealthGameManager;