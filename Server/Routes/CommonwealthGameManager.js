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
      
        this.allChance = [
          { flavorText: 'All is calm...for now', effect: ['None'] },
          { flavorText: 'New campaign funding rules mean more money rolling into your coffers for voter outreach. You can increase your re-election chances if you play your cards right.', effect: ['2x Positives', 'Super Majority Fail'] },
          { flavorText: 'Strength in numbers. The government has made a pact with new allies that is lauded by voters.', effect: [ 'Get 20' ] },
          { flavorText: 'An ambassador\'s remarks on trade set off an international crisis. Your country\'s influence declines, as does yours.', effect: [ 'Lose 20' ] },
          { flavorText: 'The world is captivated with the World Cup. No one is paying attention to politics at the moment.', effect: [ '0.5x Everything' ] },
          { flavorText: 'A big fight is looming. Your parties will clash in the biggest legislative battle of the term...after the holiday recess.', effect: [ '2x Everything', 'Long Round' ] },
          { flavorText: 'Good news! A new poll released shows your incumbent senators exceeding expectations and more likely to be reelected', effect: [ 'Get 10 Senator' ] },
          { flavorText: 'A new poll shows your incumbent senators slipping in the race with their opponents. Your fellow senators are starting to th ink you might be a lost cause.', effect: [ 'Lose 10 Senator' ] },
          { flavorText: 'Riots in the streets! It\'s a sluggish economy and voters are outraged at the government\'s slow response. Pressure is mounting to pass legislation.', effect: [ '2x Negatives', 'Super Majority Pass' ] },
          { flavorText: 'Stakes are high! The president is attempting to quickly push his signature legislation through Congress before the end of the term.', effect: [ '2x Everything', 'Speed Round' ] },
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