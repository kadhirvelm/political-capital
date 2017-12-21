var R = require('ramda');
var _ = require('underscore');

var GameManager = require('./GameManager');

class CommonwealthGameManager extends GameManager {
    constructor(io, namespace, roomID, deleteRoom, db, admin, settings){
        super(io, namespace, roomID, deleteRoom, db, admin, settings);
        console.log('Commonwealth Deck Manager Initiated');
        this.MINIMUM_SENATORS = 2;
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
          Frontier: {yes: {inFavor: 'Sen', against: -10}, no: {inFavor: 20, against: -20}},
          'Port Cities': {yes: {inFavor: 'Sen', against: -10}, no: {inFavor: 20, against: -20}},
          Farmland: {yes: {inFavor: 20, against: -20}, no: {inFavor: 'Sen', against: -10}},
          Mines: {yes: {inFavor: 20, against: -20}, no: {inFavor: 'Sen', against: -10}},
          default: {yes: {inFavor: 0, against: 0}, no: {inFavor: 0, against: 0}}
        },
        {
          flavorText: 'Great commotion has erupted from the Frontier, a precious metal has been discovered. Currently, only private entities are allowed to mine any mineral in the Commonwealth due to dangerous mining practices by private citizens many, many years ago. In an effort to capitalize on this newly discovered gold, this will repeal the previous resolution and allow private citizens to mine on the Frontier.',
          Frontier: {yes: {inFavor: 10, against: -15}, no: {inFavor: 5, against: '-Sen'}},
          Mines: {yes: {inFavor: 5, against: '-Sen'}, no: {inFavor: 10, against: -15}},
          default: {yes: {inFavor: 10, against: -15}, no: {inFavor: 10, against: -15}}
        },
        {
          flavorText: 'A trader enclave specializing in refined goods requests to open a new trading route to the Commonwealth. The proposed route would first pass through the Frontier before eventually reaching the rest of the states. This resolution would begin the construction process for this new route.',
          Frontier: {yes: {inFavor: 0, against: 0}, no: {inFavor: 10, against: -15}},
          'Port Cities': {yes: {inFavor: 5, against: '-Sen'}, no: {inFavor: 0, against: 0}},
          Farmland: {yes: {inFavor: 0, against: 0}, no: {inFavor: 5, against: '-Sen'}},
          Mines: {yes: {inFavor: 10, against: -15}, no: {inFavor: 0, against: 0}},
          default: {yes: {inFavor: 0, against: 0}, no: {inFavor: 0, against: 0}}
        },
      ];
    }

    deck2(){
      return [
        {
          flavorText: 'A well-known wildlife researcher has concluded that a widely hunted bird, commonly traded for its rich and colorful feathers will near critical levels soon. Based on the scientist\'s findings, this will create an air pollution regulatory commitee to help mitigate the negative effects plaguging the bird\'s nesting grounds.',
          'Port Cities': {yes: {inFavor: 10, against: -20}, no: {inFavor: 20, against: -10}},
          Farmland: {yes: {inFavor: 40, against: -10}, no: {inFavor: 10, against: -20}},
          Mines: {yes: {inFavor: 10, against: -20}, no: {inFavor: 20, against: -10}},
          default: {yes: {inFavor: 10, against: -10}, no: {inFavor: 20, against: -20}}
        },
        {
          flavorText: 'An agriculturally derived drug, colloquially referred to as the unicorn\'s tear has made its way into the commonwealth. The substance has allgedly caused all sorts of accidents and fatalities ever since it became widely used, yet not a single drop has been taxed since it is exclusively traded in the underground market. This would outright ban the drug in the commonwealth, making owning, distributing and consumption of it illegal.',
          Farmland: {yes: {inFavor: 'Sen', against: -30}, no: {inFavor: 50, against: -50}},
          Mines: {yes: {inFavor: 50, against: -50}, no: {inFavor: 'Sen', against: -30}},
          default: {yes: {inFavor: 30, against: -30}, no: {inFavor: 'Sen', against: 0}}
        },
        {
          flavorText: 'A massive typhoon ripped through the farmland, destroying a large percentage of the harvest for the season. In particular a generally hardy crop that both feeds the poor and is commonly moved through the land was hit hard. This would heavily subsidize costs to rebuild the farming infrastructure, though based on the damage, it will take a few seasons to see the land as agriculturally productive again.',
          'Port Cities': {yes: {inFavor: 'Sen', against: '-Sen'}, no: {inFavor: 40, against: -40}},
          Farmland: {yes: {inFavor: 30, against: -40}, no: {inFavor: 'Sen', against: '-Sen'}},
          default: {yes: {inFavor: 'Sen', against: '-Sen'}, no: {inFavor: 40, against: -40}}
        },
        {
          flavorText: 'A highly infectious plague that has an over fifty percent mortality rate has been ransacking parts of the commonwealth and is rapidly spreading across the land. In an effort to mitigate the issue, this would quarantine all infected individuals to central locations and would also forcibly burn all deceased, infected individuals.',
          Frontier: {yes: {inFavor: 0, against: '-Sen'}, no: {inFavor: 50, against: -50}},
          'Port Cities': {yes: {inFavor: 50, against: -50}, no: {inFavor: 0, against: '-Sen'}},
          Farmland: {yes: {inFavor: 0, against: 0}, no: {inFavor: 20, against: '-Sen'}},
          Mines: {yes: {inFavor: 30, against: '-Sen'}, no: {inFavor: 0, against: '-Sen'}},
          default: {yes: {inFavor: 0, against: 0}, no: {inFavor: 0, against: 0}}
        },
      ];
    }

    deck3(){
      return [
        {
          flavorText: 'As the era of machines begins to reach its climax, factory workers are beginning to come together to demand better working conditions overall slowing production. This would prohibit such a congregation of workers, favoring holistic government regulation of the private sector.',
          'Port Cities': {yes: {inFavor: 15, against: -15}, no: {inFavor: 'Sen', against: -10}},
          Mines: {yes: {inFavor: 'Sen', against: -10}, no: {inFavor: 15, against: -15}},
          default: {yes: {inFavor: 10, against: -10}, no: {inFavor: 10, against: -10}}
        },
        {
          flavorText: 'A small exploring company found an indigenous group of mountain people located just on the outskirts of the mountain state. From afar, it seemed like the group had some firepower and other advanced technologies. This would fund the exploring company to make the perilious journey back towards the mountain people and attempt a peaceful first contact for hopes of future trade.',
          'Port Cities': {yes: {inFavor: 10, against: -10}, no: {inFavor: 15, against: -15}},
          Frontier: {yes: {inFavor: 15, against: -15}, no: {inFavor: 10, against: -10}},
          default: {yes: {inFavor: 10, against: 0}, no: {inFavor: 10, against: 0}}
        },
        {
          flavorText: 'A civil war has erupted in a neighboring land between two radically different political ideologies. Out of fear of it spreading to the Commonwealth, this would increase the funding towards the central military, specifically increasing funding towards weapon production, in order to protect the people.',
          Frontier: {yes: {inFavor: 10, against: 0}, no: {inFavor: 15, against: -15}},
          Mines: {yes: {inFavor: 15, against: -15}, no: {inFavor: 10, against: 0}},
          Farmland: {yes: {inFavor: 15, against: -15}, no: {inFavor: 10, against: 0}},
          'Port Cities': {yes: {inFavor: 10, against: -10}, no: {inFavor: 10, against: 0}},
          default: {yes: {inFavor: 0, against: 0}, no: {inFavor: 0, against: 0}},
        },
        {
          flavorText: 'After having lots of trouble getting volunteers to donate their bodies to science once deceased, this would mandate all bodies of criminals be passed onto research institutions and medical facilities to further our human biology understanding.',
          'Port Cities': {yes: {inFavor: 10, against: 0}, no: {inFavor: 10, against: 0}},
          Farmland: {yes: {inFavor: 'Sen', against: -15}, no: {inFavor: 15, against: -10}},
          Mines: {yes: {inFavor: 10, against: -10}, no: {inFavor: 10, against: -10}},
          Frontier: {yes: {inFavor: 'Sen', against: 0}, no: {inFavor: 10, against: 0}},
          default: {yes: {inFavor: 0, against: 0}, no: {inFavor: 0, against: 0}}
        },
      ];
    }

    deck4(){
      return [
        {
          flavorText: 'With the advent of the printing press, literacy rates have increased as well general political participation. This has caused an increasing amount of anti-commonwealth material to be publish and available for public consumption, particularly concentrated in more lawless places of the country. This would make the distribution of such material an illegal, jailable offensive.',
          'Port Cities': {yes: {inFavor: 20, against: '-Sen'}, no: {inFavor: 'Sen', against: -10}},
          Frontier: {yes: {inFavor: 'Sen', against: -10}, no: {inFavor: 20, against: '-Sen'}},
          default: {yes: {inFavor: 10, against: -10}, no: {inFavor: 10, against: -10}}
        },
        {
          flavorText: 'A foreign country has abandonded their pursuits of establishing a satellite colony in this land and has offered to sell all the rights to the Commonwealth. What little of the land that has been explored has not produced anything worth mentioning. This would allocate the necessary funding to purchase the land from the foreign power at the cost of reducing government funded aid.',
          'Port Cities': {yes: {inFavor: 10, against: -10}, no: {inFavor: 15, against: '-Sen'}},
          Frontier: {yes: {inFavor: 15, against: '-Sen'}, no: {inFavor: 10, against: -10}},
          default: {yes: {inFavor: 'Sen', against: -10}, no: {inFavor: 15, against: '-Sen'}}
        },
        {
          flavorText: 'A set of new techniques for horse breeding have been brought into the Commonwealth, leading to the strongest and healthiest horses ever seen here, yet the demand for them is low. Looking to help capitalize on the animals, this would subsidize horse-drawn carriage building costs and put forth grants towards developing better animal-labor tools at the cost increasing taxes exported goods.',
          'Port Cities': {yes: {inFavor: 5, against: -10}, no: {inFavor: 10, against: -10}},
          Mines: {yes: {inFavor: 5, against: '-Sen'}, no: {inFavor: 20, against: -10}},
          Farmland: {yes: {inFavor: 20, against: -10}, no: {inFavor: 5, against: '-Sen'}},
          Frontier: {yes: {inFavor: 10, against: -10}, no: {inFavor: 5, against: -10}},
          default: {yes: {inFavor: 0, against: 0}, no: {inFavor: 0, against: 0}}
        },
        {
          flavorText: 'A private corporation is currently contracted to further develop the country\'s transportation infrastructure, specifically for the Commonwealth\'s mail system by expanding the paved roads infrastructure. The progress has been slow, inciting public outcry at wasted tax payer money. This would end the contract with this private entity, opening up funding towards other projects.',
          'Port Cities': {yes: {inFavor: 50, against: '-Sen'}, no: {inFavor: 'Sen', against: -10}},
          Mines: {yes: {inFavor: 50, against: '-Sen'}, no: {inFavor: 'Sen', against: -10}},
          Farmland: {yes: {inFavor: 'Sen', against: -10}, no: {inFavor: 50, against: '-Sen'}},
          Frontier: {yes: {inFavor: 'Sen', against: -10}, no: {inFavor: 'Sen', against: '-Sen'}},
          default: {yes: {inFavor: 0, against: 0}, no: {inFavor: 0, against: 0}}
        },
      ];
    }

    deck5(){
      return [
        {
          flavorText: 'A few coal mines have suffered disastrous losses after an earthquake (that may have been triggered by faulty mining explosives) caused some central support beams to collapse, killing tens of workers. In response, this would force mining companies to allocate funding towards further investigating their current mining practices.',
          'Port Cities': {yes: {inFavor: 30, against: -30}, no: {inFavor: 'Sen', against: -5}},
          Mines: {yes: {inFavor: 'Sen', against: -5}, no: {inFavor: 30, against: -30}},
          default: {yes: {inFavor: 20, against: -20}, no: {inFavor: 'Sen', against: -5}}
        },
        {
          flavorText: 'After amassing lots of political influence and government contracts, a private railroad corporation has been found consistently skimping out on paying taxes despite making large progress on the public rail system infrastructure. This would force the giant corporation to disband and form into smaller entities, each of which would be easier to police and regulate, but would all current railroad projects on hold until a settlement can be reached.',
          'Port Cities': {yes: {inFavor: 40, against: -40}, no: {inFavor: 5, against: -5}},
          Frontier: {yes: {inFavor: 5, against: -5}, no: {inFavor: 40, against: -40}},
          default: {yes: {inFavor: 10, against: -10}, no: {inFavor: 10, against: -10}}
        },
        {
          flavorText: 'An increasing number of workers are becoming frustrated with the living conditions and going on strike. As an effort to incentivize people back, this would create a require all manual labor-related jobs to meet the same labor condition standards set by the mining industry.',
          'Port Cities': {yes: {inFavor: 5, against: '-Sen'}, no: {inFavor: 20, against: -20}},
          Mines: {yes: {inFavor: 20, against: -20}, no: {inFavor: 5, against: '-Sen'}},
          Frontier: {yes: {inFavor: 30, against: -30}, no: {inFavor: 5, against: '-Sen'}},
          Farmland: {yes: {inFavor: 5, against: '-Sen'}, no: {inFavor: 30, against: -30}},
          default: {yes: {inFavor: 0, against: 0}, no: {inFavor: 0, against: 0}}
        },
        {
          flavorText: 'A foreign ship trading company has offered to import high quality steel farming tools at lower than market rate in exchange for free passage in and out of the Commonwealth for a set period of 10 years. This would accept the conditions of the contract and allow these foreign traders free passage in and out of the country.',
          Farmland: {yes: {inFavor: 40, against: -40}, no: {inFavor: 5, against: -5}},
          Mines: {yes: {inFavor: 5, against: -5}, no: {inFavor: 40, against: -40}},
          default: {yes: {inFavor: 10, against: -10}, no: {inFavor: 10, against: -10}}
        }
      ];
    }

    gameResolutionsAndChange(){
        const compiledResolutionDecks = [
          this.deck1(),
          this.deck2(),
          this.deck3(),
          this.deck4(),
          this.deck5()
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
      return resolution[this.playerNameToParty(changePlayerName)] || resolution.default;
    }

    initialPartyCards(){
      return {neutral: ['Get 20', 'Take 20', 'Get Sen', 'Nullify', '2x', 'Give 20', 'Lose 20', 'Lose Sen']};
    }

    isPartyCardType(partyCardValue, type){
      return partyCardValue.includes(types);
    }

    calculatedRoundBonus(bonus, favor, changePlayerName){
      return bonus * (this.individualPlayerBonuses && this.individualPlayerBonuses[changePlayerName] && this.individualPlayerBonuses[changePlayerName].roundBonus || 1);
    }

    handleNeutralPartyCard(roundPartyCard, partyObject){
      _.each(partyObject.players, (playerName) => {
        if ( this.isPartyCardType(roundPartyCard.value,'Take') || this.isPartyCardType(roundPartyCard.value,'Nullify') || this.isPartyCardType(roundPartyCard.value,'Give')){
          this.handleThesePartyCards[playerName] = roundPartyCard.value;
        } else if (this.isPartyCardType(roundPartyCard.value,'Get') || this.isPartyCardType(roundPartyCard.value,'Lose')){
          const modifier = this.isPartyCardType(roundPartyCard.value,'Get') ? '' : '-';
          const value = parseInt(roundPartyCard.value, 10);
          this.individualPlayerBonuses[playerName] = value ? {roundBonusFlat: modifier + value} : {newSenators: modifier + 1};
        } else if (this.isPartyCardType(roundPartyCard.value, '2x')){
          this.individualPlayerBonuses[playerName] = {roundBonus: parseInt(roundPartyCard.value, 10)};
        }
      });
    }

    handlePartyCardActions(socket){
      super.handlePartyCardActions(socket);

      socket.on('Give', (toPlayer) => {
        if (this.catchObjectErrors(this.players, this.playerNames[socket.id]) && this.catchObjectErrors(this.players, fromPlayer)){
          this.stealAndTakeLogic(fromPlayer, 20, this.playerNames[socket.id]);
        }
      });
    }
}

module.exports = CommonwealthGameManager;
