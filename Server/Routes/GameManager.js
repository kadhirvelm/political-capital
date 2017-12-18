var R = require('ramda');
var _ = require('underscore');

var returnRandomPartyName = require('./Catalog').returnRandomPartyName;

class GameManager {

  constructor(io, namespace, roomID, deleteRoom, db, admin, settings){
    this.io = io;
    this.namespace = namespace;
    this.roomSocket = io.of(this.namespace);
    this.handleRoomSocketConnection();

    this.roomID = roomID;
    this.deleteRoom = deleteRoom;
    this.db = db;
    this.admin = admin;
    this.settings = settings;
    this.playerNames = {};

    console.log('Game Manager initiated - ' + namespace);
    this.initialGameSettings();

    if (this.roomID !== 'PENDING'){
      this.fetchGameFromDB();
    }
    this.numUniqueParties = () => R.length(R.uniq(R.map((player) => R.prop('party', player), R.values(this.players))));
    this.gameResolutionsAndChange();
  }

  setBaseRoundBonuses(){
    this.passesBonus = 1;
    this.failsBonus = 1;
    this.yesVoteModifier = 1;
    this.noVoteModifier = 1;
  }

  setBaseRoundData(){
    this.rounds = {};
    this.players = {};
    this.parties = {};
  }

  baseSettings(){
    return {
      START_SENATORS: 3,
      START_CAPITAL: 60,
      ROUNDS: 10,
      SENATE_TAX: 20,
      WIN: 'Individual',
    };
  }

  setPartyCards(){
    this.handleThesePartyCards = {};
    this.individualPlayerBonuses = {};
    this.currActionsAgainstPlayers = {};
  }

  setRoundGameStats(){
    this.roundWinner = undefined;
    this.currentRound = 0;
    this.endGame = {};
  }

  initialGameSettings(){
    this.settings = this.settings || this.baseSettings();
    this.inGame = false;
    this.setRoundGameStats();
    this.setPartyCards();
    this.setBaseRoundData();
    this.setBaseRoundBonuses();
  }

  gameResolutionsAndChange(){
    this.allResolution = [
      {flavorText: 'Continue to fund the public infrastructure revamp, which has already gone significantly over budget. The completion would greatly reduce the traffic and make transportation easier. The public has been irate with the growing deficit.', yes: {inFavor: 10, against: -20}, no: {inFavor: 5, against: -5}},
      {flavorText: 'Creates a universal minimum income for all citizens of the country. The president has already expressed vehement opposition due to implementation hassles and promises to veto the bill. This is a chance to gain voter support from the split public.', yes: {inFavor: 20, against: 0}, no: {inFavor: 20, against: 0}},
      {flavorText: 'During the worst economic crisis of the century, the president has proposed a stimulus package to help boost the economy. Economists have been split whether the package will help.', yes: {inFavor: 'Sen', against: '-Sen'}, no: {inFavor: 'Sen', against: '-Sen'}},
      {flavorText: 'Forty years ago, the public was staunchly against this mind-enhancement drug. Since then, public opinion has been shifting favorably due to the benefits of the drug, though the long term effecst are still unclear.', yes: {inFavor: 20, against: -10}, no: {inFavor: 10, against: -20}},
      {flavorText: 'This controversial bill would overhaul the education industry. If it passes and does well, this would be the current governments crowning achievement. All parents across the country are watching.', yes: {inFavor: 'Sen', against: '-Sen'}, no: {inFavor: 20, against: 10}},
      {flavorText: 'Changing the country\'s constitution to abolish term limits for elected officials. A bill like this does not gain support it needs often, consequently the public has been watching closely because it would set the law for decades to come.', yes: {inFavor: 20, against: -20}, no: {inFavor: 20, against: -20}},
      {flavorText: 'Would increase regulations on a private sector, specifically targeting a single company. Though this bill is largely symbolic since the regulations are not very strict, it would set a strong precedent for private versus public interest.', yes: {inFavor: 5, against: -15}, no: {inFavor: 5, against: -15}},
      {flavorText: 'The really popular president has proposed to funnel substantial amounts of money to make his dream of a moon colony into reality. The public loves it, but the technology does not seem to be there.', yes: {inFavor: 20, against: -10}, no: {inFavor: 'Sen', against: '-Sen'}},
      {flavorText: 'Allocates funding to construct a new monemnet. Public opinion is unsure and would follow along with the decision. The funding required is also minimal and does not detract from other government programs.', yes: {inFavor: 15, against: 0}, no: {inFavor: 15, against: 0}},
      {flavorText: 'Voting to create a committee to rename a well-known national park. New revelations have surfaced that the previous namesake lied about their achievements and is now in jail. Likely any name chosen will be an upgrade.', yes: {inFavor: 10, against: -5}, no: {inFavor: 10, against: -5}},
    ];

    this.allChance = [
      {flavorText: 'All is calm...for now', effect: ['None']},
      {flavorText: 'New campaign funding rules mean more money rolling into your coffers for voter outreach. You can increase your re-election chances if you play your cards right.', effect: ['2x Positives', 'Super Majority Fail']},
      {flavorText: 'Strength in numbers. The government has made a pact with new allies that is lauded by voters.', effect: ['Get 20']},
      {flavorText: 'An ambassador\'s remarks on trade set off an international crisis. Your country\'s influence declines, as does yours.', effect: ['Lose 20']},
      {flavorText: 'The world is captivated with the World Cup. No one is paying attention to politics at the moment.', effect: ['0.5x Everything']},
      {flavorText: 'A big fight is looming. Your parties will clash in the biggest legislative battle of the term...after the holiday recess.', effect: ['2x Everything', 'Long Round']},
      {flavorText: 'Good news! A new poll released shows your incumbent senators exceeding expectations and more likely to be reelected', effect: ['Get 10 Senator']},
      {flavorText: 'A new poll shows your incumbent senators slipping in the race with their opponents. Your fellow senators are starting to th ink you might be a lost cause.', effect: ['Lose 10 Senator']},
      {flavorText: 'Riots in the streets! It\'s a sluggish economy and voters are outraged at the government\'s slow response. Pressure is mounting to pass legislation.', effect: ['2x Negatives', 'Super Majority Pass']},
      {flavorText: 'Stakes are high! The president is attempting to quickly push his signature legislation through Congress before the end of the term.', effect: ['2x Everything', 'Speed Round']},
    ];
  }

  updateRoomID(id){
    this.roomID = id;
    this.fetchGameFromDB();
  }

  disconnect(){
    const details = {'roomID' : this.roomID.toString()};
    this.db.collection('games').deleteOne(details);

    const connectedNamespaceSockets = Object.keys(this.roomSocket.connected);
    connectedNamespaceSockets.forEach( (socketID) => {
      this.roomSocket.connected[socketID].disconnect();
    });
    this.roomSocket.removeAllListeners();
    delete this.io.nsps[this.namespace];
  }

  updateAdmin(newAdmin){
    this.admin = newAdmin;
    this.roomSocket.emit('updateAdmin', newAdmin);
  }

  updateRoomDetails(){
    var ObjectID = require('mongodb').ObjectID;
    const details = {'_id' : new ObjectID(this.roomID)};
    const newRoom = {$set: {inGame: this.inGame, players: this.players, settings: this.settings, admin: this.admin}};
    this.db.collection('rooms').update(details, newRoom, (err, result) => {
      if (err){
        console.log('Updating room details error', err);
      }
    });
  }

  setCurrentGameSettingsBasedOnDBSettings(item){
    this.inGame = item.inGame;
    this.rounds = item.rounds;
    this.players = item.players;
    this.parties = item.parties;
    this.currentRound = item.currentRound;
    this.handleThesePartyCards = item.handleThesePartyCards || (this.rounds && this.rounds[this.currentRound] && this.rounds[this.currentRound].handleThesePartyCards);
    this.individualPlayerBonuses = item.individualPlayerBonuses || (this.rounds && this.rounds[this.currentRound] && this.rounds[this.currentRound].individualPlayerBonuses);
    this.passesBonus = item.passesBonus || this.passesBonus;
    this.failsBonus = item.failsBonus || this.failsBonus;
    this.yesVoteModifier = item.yesVoteModifier || this.yesVoteModifier;
    this.noVoteModifier = item.noVoteModifier || this.noVoteModifier;
    this.roundWinner = item.roundWinner || this.roundWinner;
    this.currActionsAgainstPlayers = item.currActionsAgainstPlayers || this.currActionsAgainstPlayers;
    this.endGame = item.endGame || this.endGame;
  }

  fetchGameFromDB(){
    this.db.collection('games').findOne({'roomID' : this.roomID.toString()}, (error, item) => {
      if (error){
        console.log('Error fetching game', roomID);
      } else if (item) {
        this.setCurrentGameSettingsBasedOnDBSettings(item);
      } else if (_.isNull(item)){
        console.log('Creating new game');
        const newGame = {roomID: this.roomID.toString(), players: {}, rounds: {}, parties: {}, currentRound: 0};
        this.db.collection('games').insert(newGame);
      }
    });
  }

  updateGame(){
    const details = {'roomID': this.roomID.toString()};
    const updatedGame = {roomID: this.roomID.toString(), rounds: this.rounds, players: this.players, parties: this.parties, currentRound: this.currentRound, inGame: this.inGame,
      handleThesePartyCards: this.handleThesePartyCards, individualPlayerBonuses: this.individualPlayerBonuses, passesBonus: this.passesBonus, failsBonus: this.failsBonus,
      yesVoteModifier: this.yesVoteModifier, noVoteModifier: this.noVoteModifier, roundWinner: this.roundWinner, currActionsAgainstPlayers: this.currActionsAgainstPlayers, endGame: this.endGame};
    this.db.collection('games').update(details, updatedGame, (err, result) => {
      if (err){
        console.log(err);
      }
    });
  }

  addToGameHistory(endGame){
    this.db.collection('game_history').insert(endGame);
  }

  unreadyPlayersWithNewSettings(){
    this.players = _.mapObject(this.players, (value, key) => {
      return {name: value.name, isReady: false};
    });
    this.emitFullGame();
  }

  adjustSettings(newSettings){
    this.settings = newSettings;
    this.unreadyPlayersWithNewSettings();
    this.updateRoomDetails();
    this.roomSocket.emit('updatedSettings', newSettings);
  }

  checkDeleteRoom(){
    if (this.roomSocket){
      setTimeout(() => {
        this.roomSocket.clients( (error, clients) => {
          if (clients.length === 0 && process.env.REACT_APP_DEBUG !== 'true') {
            this.deleteRoom(this.roomID);
          }
        });
      }, 30000);
    } else {
      this.deleteRoom(this.roomID);
    }
  }

  updateAllPlayers(){
    this.roomSocket.emit('updatePlayers', this.players);
    this.roomSocket.emit('allPlayersReady', R.isEmpty(R.filter( (player) => player.isReady === false, this.players)));
  }

  emitFullGame(socket = this.roomSocket){
    socket.emit('receiveFullGame', {parties: this.parties, players: this.players, currentRound: this.currentRound, rounds: this.rounds, settings: this.settings, inGame: this.inGame, endGame: this.endGame});
  }

  checkIfAllPartyNamesSet(){
    if ( R.length(R.keys(_.filter(this.parties, (party) => !_.isEmpty(party.players)))) === this.numUniqueParties()) {
      this.roomSocket.emit('allPartyNamesSet', this.parties);
      this.advanceRound(1);
    } else {
      this.emitFullGame();
    }
  }

  advanceRoundWithinGameMax(){
    this.currentRound += 1;
    this.rounds[this.currentRound] = {
      resolution: this.returnRandomResolution(),
      chance: this.returnRandomChance(),
      individualVotes: {},
      totalVotes: {},
      partyCards: {},
      currentRoundStats: this.copyCurrentStats(),
    };
    this.roomSocket.emit('nextRound', {rounds: this.rounds, players: this.players, parties: this.parties, currentRound: this.currentRound} );
    this.updateRoomDetails();
  }

  setEndGame(){
    this.currentRound = undefined;
    this.endGame = {rounds: this.rounds, players: this.players, parties: this.parties, finalWinners: this.finalWinners()};
    this.roomSocket.emit('endGame', this.endGame);
    this.addToGameHistory(this.endGame);
  }

  advanceRound(maxAdvance){
    if (this.currentRound < (maxAdvance || this.settings.ROUNDS)) {
      this.advanceRoundWithinGameMax();
    } else if (this.currentRound >= this.settings.ROUNDS) {
      this.setEndGame();
    }
    this.updateGame();
  }

  checkIfAllPartyCardsSet(){
    if (R.length(R.keys(this.rounds[this.currentRound].partyCards)) === this.numUniqueParties()){
      this.roomSocket.emit('allPartiesSelectedPartyCard', {players: this.players, parties: this.parties, rounds: this.rounds, currentRound: this.currentRound});
      this.updateGame();
    }
  }

  returnRandomResolution(){
    const tempResolution = this.returnRandom(this.allResolution);
    this.allResolution = tempResolution.newArray;
    return tempResolution.item;
  }

  returnRandomChance(){
    const tempResolution = this.returnRandom(this.allChance);
    this.allChance = tempResolution.newArray;
    return tempResolution.item;
  }

  returnRandom(array){
    const sampleItem = _.sample(array);
    array = _.reject(array, (item) => _.isEqual(item, sampleItem));
    return {item: sampleItem, newArray: array};
  }

  copyCurrentStats(){
    const currentRoundStats = {};
    _.each(this.players, (player) => {
      currentRoundStats[player.name] = {
        party: player.party,
        politicalCapital: player.politicalCapital,
        senators: player.senators,
      };
    });
    return currentRoundStats;
  }

  hasTypeOfCard(type){
    return _.contains(_.values(this.rounds[this.currentRound].handleThesePartyCards), type);
  }

  updateGameVote(){
    this.emitFullGame();
    if (_.keys(this.rounds[this.currentRound].individualVotes).length === _.keys(this.players).length) {
      this.resetBonusTrackers();
      this.calculateRoundLogic();
    }
  }

  handleDistributingOrActionablePartyCards(){
    if (!this.hasTypeOfCard('Nullify') && !this.hasTypeOfCard('Steal') && !this.hasTypeOfCard('Take')){
      this.beginDistributingCapitalAndSenators();
      this.advanceRound();
    } else {
      this.updateGame();
    }
  }

  calculateRoundLogic(){
    this.rounds[this.currentRound].changeLogic = {};
    _.each(this.rounds[this.currentRound].chance.effect, (chance) => {
      this.chanceEffect(chance);
    });

    this.totalVotes();

    R.forEachObjIndexed((roundPartyCard, party) => this.handlePartyCardEffects(roundPartyCard, party), this.rounds[this.currentRound].partyCards);
    this.rounds[this.currentRound].handleThesePartyCards = this.handleThesePartyCards;
    this.rounds[this.currentRound].individualPlayerBonuses = this.individualPlayerBonuses;
    this.rounds[this.currentRound].actionsAgainstPlayer = this.actionsAgainstPlayers();

    this.roomSocket.emit('allVotingFinalized', {rounds: this.rounds, currentRound: this.currentRound});
    this.handleDistributingOrActionablePartyCards();
  }

  actionsAgainstPlayers(){
    return _.mapObject(this.handleThesePartyCards, (value, key) => {
      return {selectedPlayer: '', card: value, confirmed: false};
    });
  }

  resetBonusTrackers(){
    this.passesBonus = 1;
    this.failsBonus = 1;
    this.yesVoteModifier = 1;
    this.noVoteModifier = 1;
    this.roundWinner = undefined;
    this.individualPlayerBonuses = {};
    this.handleThesePartyCards = {};

    R.forEach( (playerName) => {
      this.individualPlayerBonuses[playerName] = {roundBonus: 1, newSenators: 0, roundBonusFlat: 0};
    }, _.keys(this.players));
  }

  changePlayerLogic(key, playerName, amount){
    this.rounds[this.currentRound].changeLogic[playerName] = this.rounds[this.currentRound].changeLogic[playerName] || {};
    this.rounds[this.currentRound].changeLogic[playerName][key] = (this.rounds[this.currentRound].changeLogic[playerName][key] || 0) + amount;
  }

  handleGainingAndLosingLogic(amount, changeBaseOnSenators){
    _.each(_.values(this.players), (player) => {
      player.politicalCapital += amount * (changeBaseOnSenators ? player.senators : 1);
      this.changePlayerLogic('chance', player.name, amount);
    });
  }

  chanceEffect(effect){
    switch (effect){
      case 'Get 20':
        this.handleGainingAndLosingLogic(20);
        break;
      case 'Lose 20':
        this.handleGainingAndLosingLogic(-20);
        break;
      case 'Lose 10 Senator':
        this.handleGainingAndLosingLogic(-10, true);
        break;
      case 'Get 10 Senator':
        this.handleGainingAndLosingLogic(10, true);
        break;
      case '2x Everything':
        this.passesBonus = 2;
        this.failsBonus = 2;
        break;
      case '0.5x Everything':
        this.passesBonus = 0.5;
        this.failsBonus = 0.5;
        break;
      case '2x Positives':
        this.passesBonus = 2;
        break;
      case '2x Negatives':
        this.failsBonus = 2;
        break;
      case 'Super Majority Fail':
        this.yesVoteModifier = 2;
        break;
      case 'Super Majority Pass':
        this.noVoteModifier = 2;
        break;
      default:
        break;
    }
  }

  determineTiedWinner(){
    this.roundWinner = Math.random() > 0.5 ? 'yes' : 'no';
  }

  determineCurrentRoundWinner(yesTotal, noTotal){
    if (yesTotal !== noTotal){
      this.roundWinner = (yesTotal > noTotal) ? 'yes' : 'no';
    } else {
      this.determineTiedWinner();
    }
  }

  totalVotes(){
    const totalVotes = {yes: 0, no: 0};
    _.each(_.values(this.rounds[this.currentRound].individualVotes), (individualVote) => {
      totalVotes.yes += individualVote.yes;
      totalVotes.no += individualVote.no;
    });
    this.rounds[this.currentRound].totalVotes = totalVotes;
    this.determineCurrentRoundWinner(totalVotes.yes * this.yesVoteModifier, totalVotes.no * this.noVoteModifier);
    this.rounds[this.currentRound].roundWinner = this.roundWinner;
  }

  handleTypedPartyCard(roundPartyCard, partyObject){
    _.each(partyObject.players, (playerName) => {
      if (roundPartyCard.value !== 'Steal'){
        this.individualPlayerBonuses[this.playerName] = (roundPartyCard.value === '2x') ? {roundBonus: 2,} : {newSenators: 1};
      } else {
        this.handleThesePartyCards[playerName] = 'Steal';
      }
    });
  }

  handleNeutralPartyCard(roundPartyCard, partyObject){
    _.each(partyObject.players, (playerName) => {
      if (roundPartyCard.value === 'Take' || roundPartyCard.value === 'Nullify'){
        this.handleThesePartyCards[playerName] = (roundPartyCard.value === 'Take') ? 'Take' : 'Nullify';
      } else if (roundPartyCard.value === 'Get') {
        this.individualPlayerBonuses[playerName] = {roundBonusFlat: 20};
      }
    });
  }

  handlePartyCardEffects(roundPartyCard, party){
    const partyObject = _.first(_.filter(this.parties, function(eachParty) {
      return eachParty.partyName === party;
    }));
    if (roundPartyCard.type === this.roundWinner) {
      this.handleTypedPartyCard(roundPartyCard, partyObject);
    } else if (roundPartyCard.type === 'neutral'){
      this.handleNeutralPartyCard(roundPartyCard, partyObject);
    }
  }

  currentResolutionPayout(resolution) {
    return resolution[this.roundWinner];
  }

  handlePoliticalCapitalDistribution(votes, changePlayerName, finalResolutionPayout, yesFavor, noFavor){
    const politicalCapitalYes = votes.yes * (_.isString(finalResolutionPayout[yesFavor]) ? 0 : finalResolutionPayout[yesFavor]) * this.passesBonus * ( yesFavor === 'inFavor' ? ((this.individualPlayerBonuses[changePlayerName] && this.individualPlayerBonuses[changePlayerName].roundBonus) || 1) : 1);
    const politicalCapitalNo = votes.no * (_.isString(finalResolutionPayout[noFavor]) ? 0 : finalResolutionPayout[noFavor]) * this.failsBonus * ( noFavor === 'inFavor' ? (this.individualPlayerBonuses[changePlayerName].roundBonus || 1) : 1);
    const politicalCapitalOther = ((this.individualPlayerBonuses[changePlayerName] && this.individualPlayerBonuses[changePlayerName].roundBonusFlat) || 0);

    this.players[changePlayerName].politicalCapital += politicalCapitalYes + politicalCapitalNo + politicalCapitalOther;
    this.players[changePlayerName].politicalCapital = Math.round(this.players[changePlayerName].politicalCapital);

    this.changePlayerLogic('politicalCapitalYes', changePlayerName, politicalCapitalYes);
    this.changePlayerLogic('politicalCapitalNo', changePlayerName, politicalCapitalNo);
    this.changePlayerLogic('politicalCapitalOther', changePlayerName, politicalCapitalOther);
  }

  handleSenatorDistribution(votes, changePlayerName, finalResolutionPayout, yesFavor, noFavor){
    const senatorResolution = (votes.no === 0 ? (_.isString(finalResolutionPayout[yesFavor]) ? ( finalResolutionPayout[yesFavor].startsWith('-') ? -1 * this.failsBonus : 1 * this.passesBonus * ((this.individualPlayerBonuses[changePlayerName] && this.individualPlayerBonuses[changePlayerName].roundBonus) || 1)) : 0): 0)
    + (votes.yes === 0 ? (_.isString(finalResolutionPayout[noFavor]) ? ( finalResolutionPayout[noFavor].startsWith('-') ? -1 * this.failsBonus : 1 * this.passesBonus * (this.individualPlayerBonuses[changePlayerName].roundBonus || 1)) : 0): 0);
    const senatorOther = ((this.individualPlayerBonuses[changePlayerName] && this.individualPlayerBonuses[changePlayerName].newSenators) || 0);

    this.players[changePlayerName].senators += senatorResolution + senatorOther;
    this.players[changePlayerName].senators = Math.max(Math.round(this.players[changePlayerName].senators), this.settings.START_SENATORS);

    this.changePlayerLogic('senatorResolution', changePlayerName, Math.round(senatorResolution));
    this.changePlayerLogic('senatorOther', changePlayerName, Math.round(senatorOther));
  }

  handleTaxDeduction(changePlayerName){
    if (this.currentRound % 2 === 0){
      const numSenatorsPaidOff = (this.players[changePlayerName].politicalCapital - (this.players[changePlayerName].politicalCapital % this.settings.SENATE_TAX))/this.settings.SENATE_TAX;

      const totalSenatorsForTax = Math.min(this.players[changePlayerName].senators, Math.max(Math.round(numSenatorsPaidOff), 3));
      const totalSenatorTax = Math.min(this.players[changePlayerName].senators, Math.max(Math.round(numSenatorsPaidOff), 3)) * -this.settings.SENATE_TAX;
      
      this.players[changePlayerName].senators = (numSenatorsPaidOff >= this.players[changePlayerName].senators) ? this.players[changePlayerName].senators : Math.max(Math.round(numSenatorsPaidOff), 3);
      this.players[changePlayerName].politicalCapital -= this.players[changePlayerName].senators * this.settings.SENATE_TAX;

      this.changePlayerLogic('totalSenatorsForTax', changePlayerName, totalSenatorsForTax);
      this.changePlayerLogic('totalSenatorTax', changePlayerName, totalSenatorTax);
    }
  }

  beginDistributingCapitalAndSenators(){
    const handleIncreaseAndDecrease = (votes, changePlayerName) => {
      const finalResolutionPayout = this.currentResolutionPayout(this.rounds[this.currentRound].resolution, changePlayerName);
      const yesFavor = this.roundWinner === 'yes' ? 'inFavor' : 'against';
      const noFavor = this.roundWinner === 'no' ? 'inFavor' : 'against';
      this.handlePoliticalCapitalDistribution(votes, changePlayerName, finalResolutionPayout, yesFavor, noFavor);
      this.handleSenatorDistribution(votes, changePlayerName, finalResolutionPayout, yesFavor, noFavor);
      this.handleTaxDeduction(changePlayerName);
    };
    R.forEachObjIndexed( handleIncreaseAndDecrease, this.rounds[this.currentRound].individualVotes);
  }

  transferFromPlayer(amount, fromPlayer, toPlayer){
    if (!_.isUndefined(fromPlayer) && !_.isUndefined(toPlayer) && this.players[fromPlayer] && this.players[toPlayer]){
      const totalAmount = Math.min(amount, Math.max(this.players[fromPlayer].politicalCapital, 0));
      this.players[fromPlayer].politicalCapital -= totalAmount;
      this.players[toPlayer].politicalCapital += totalAmount;
      this.emitFullGame();
    }
  }

  removeFromHandleThesePartyCards(playerName){
    if (this.currentRound && this.rounds){
      this.rounds[this.currentRound].handleThesePartyCards = _.omit(this.rounds[this.currentRound].handleThesePartyCards, playerName);
      this.roomSocket.emit('updateRound', this.rounds);
      if (_.isEmpty(this.rounds[this.currentRound].handleThesePartyCards)){
        this.beginDistributingCapitalAndSenators();
        this.advanceRound();
      }
    }
  }

  finalWinners(){
    _.forEach(this.parties, (party) => {
      party.totalPoliticalCapital = R.sum(_.map(party.players, (player) => this.players[player].politicalCapital)) / R.length(party.players);
    });
    const sortedParties = _.sortBy(_.values(this.parties), 'totalPoliticalCapital');
    const sortedPlayers = _.sortBy(_.values(this.players), 'politicalCapital');

    return {sortedParties: sortedParties, sortedPlayers: sortedPlayers};
  }

  setInGame(value){
    this.inGame = value;
  }

  catchObjectErrors(object, property){
    try {
      const outputProps = R.prop(property, object);
      return !_.isUndefined(outputProps);
    } catch (e){
      console.log('Error object', object, property);
      return false;
    }
  }

  initialPartyCards(){
    return {yes: ['2x', 'Steal', 'Senator'], no: ['2x', 'Steal', 'Senator'], neutral: ['Get', 'Take', 'None', 'Nullify']};
  }

  /**
   * Handle all individual player socket connections
   */

  handleRoomSocketConnection(){
    this.roomSocket.on('connection', (socket) => {
      this.handleSocketCallback(socket);
    });
  }

  finalizePartyCardLogic(socket, partyCard){
    const playerParty = this.players[this.playerNames[socket.id]].party;
    const party = this.parties[playerParty];
    party.partyCards[partyCard.type] = _.without(party.partyCards[partyCard.type], partyCard.value);
    this.rounds[this.currentRound].partyCards[party.partyName] = partyCard;
    this.roomSocket.to(playerParty).emit('finalizePartyCard', this.rounds);
    this.emitFullGame();
    this.checkIfAllPartyCardsSet();
  }

  handlePartyCards(socket){
    socket.on('getPartyCards', () => {
      if (this.catchObjectErrors(this.players, this.playerNames[socket.id])){
        const playerParty = this.players[this.playerNames[socket.id]] && this.players[this.playerNames[socket.id]].party;
        const party = this.parties ? this.parties[playerParty] : {partyName: ''};
        if (!_.isUndefined(party) && this.currentRound){
          const selectedPartyCard = ( this.rounds[this.currentRound] ? this.rounds[this.currentRound].partyCards[party.partyName] : {});
          socket.emit('receivePartyCards', {parties: this.parties, selectedPartyCard: selectedPartyCard} );
        }
      }
    });
    socket.on('selectPartyCard', (partyCard) => {
      if (this.catchObjectErrors(this.players, this.playerNames[socket.id])){
        const playerParty = this.players[this.playerNames[socket.id]].party;
        this.roomSocket.to(playerParty).emit('selectPartyCard', partyCard);
      }
    });
    socket.on('finalizePartyCard', (partyCard) => {
      if (this.catchObjectErrors(this.players, this.playerNames[socket.id])){
        this.finalizePartyCardLogic(socket, partyCard);
      }
    });
  }

  handleVoteAndActionRecording(socket){
    socket.on('vote', (vote) => {
      if (this.currentRound && this.playerNames[socket.id]){
        this.rounds[this.currentRound].individualVotes[this.playerNames[socket.id]] = vote;
        this.updateGameVote();
      }
    });

    socket.on('recordAction', (action) => {
      this.roomSocket.emit('actionsAgainstPlayers', _.extend(action, {fromPlayer: this.playerNames[socket.id]}));
    });
  }

  stealAndTakeLogic(socket, amount, fromPlayer){
    this.transferFromPlayer(amount, fromPlayer, this.playerNames[socket.id]);

    this.changePlayerLogic('steal', fromPlayer, -amount);
    this.changePlayerLogic('steal', this.playerNames[socket.id], amount);

    this.removeFromHandleThesePartyCards(this.playerNames[socket.id]);
  };

  handlePartyCardActions(socket){
    socket.on('Nullify', (toPlayer) => {
      if (this.currentRound){
        this.rounds[this.currentRound].individualPlayerBonuses[toPlayer] = {roundBonus: 1, newSenators: 0, roundBonusFlat: 0};
        this.rounds[this.currentRound].handleThesePartyCards = _.omit(this.rounds[this.currentRound].handleThesePartyCards, toPlayer);
        this.removeFromHandleThesePartyCards(this.playerNames[socket.id]);
      }
    });

    socket.on('Steal', (fromPlayer) => {
      if (this.catchObjectErrors(this.players, this.playerNames[socket.id]) && this.catchObjectErrors(this.players, fromPlayer)){
        this.stealAndTakeLogic(socket, this.players[fromPlayer].senators * 5, fromPlayer);
      }
    });

    socket.on('Take', (fromPlayer) => {
      if (this.catchObjectErrors(this.players, this.playerNames[socket.id]) && this.catchObjectErrors(this.players, fromPlayer)){
        this.stealAndTakeLogic(socket, 20, fromPlayer);
      }
    });
  }

  handleGameMechanics(socket){
    socket.on('getCurrentRoundDetails', () => {
      socket.emit('updateCurrentRoundDetails', {currentRound: this.currentRound, rounds: this.rounds});
    });

    socket.on('transferToPlayer', (amount, toPlayer) => {
      if (this.catchObjectErrors(this.players, this.playerNames[socket.id]) && this.catchObjectErrors(this.players, toPlayer)){
        this.transferFromPlayer(amount, this.playerNames[socket.id], toPlayer);
        this.roomSocket.emit('bribeSentOut', amount);
      }
    });

    this.handlePartyCards(socket);
    this.handlePartyCardActions(socket);
    this.handleVoteAndActionRecording(socket);
  }

  returnPartyName(party){
    if (this.parties && this.parties[party] && this.parties[party].partyName){
      return this.parties[party].partyName;
    }
    this.parties[party] = {partyName: returnRandomPartyName(), partyCards: this.initialPartyCards(), players:[]};
    return this.parties[party].partyName;
  }

  handlePartyNameLogic(socket){
    socket.on('getInitialPartyName', (party) => {
      this.roomSocket.to(party).emit('getPartyName', this.returnPartyName(party));
    });

    socket.on('setPartyName', (name) => {
      if (this.catchObjectErrors(this.players, this.playerNames[socket.id])){
        const playerParty = this.players[this.playerNames[socket.id]].party;
        this.roomSocket.to(playerParty).emit('getPartyName', name);
      }
    });

    socket.on('finalizePartyName', (name) => {
      if (this.catchObjectErrors(this.players, this.playerNames[socket.id])){
        const playerParty = this.players[this.playerNames[socket.id]].party;
        this.parties[playerParty].players.push(this.playerNames[socket.id]);
        _.forEach(this.players, (player) => {
          if (player.party === playerParty && (!_.contains(this.parties[playerParty].players, player.name))){
            this.parties[playerParty].players.push(player.name);
          }
        });

        this.parties[playerParty].players = R.uniq(this.parties[playerParty].players);

        this.roomSocket.to(playerParty).emit('finalizePartyName', name);
        this.updateGame();
        this.checkIfAllPartyNamesSet();
      }
    });
  }

  clearSocketRooms(socket, partyNumber){
    _.each(_.values(socket.rooms), (room) => {
      if (room !== socket.id && room !== partyNumber) {
        socket.leave(room);
      }
    });
  }

  handleIndividualPlayerSettings(socket){
    socket.on('adjustSettings', (settings) => {
      if (this.playerNames[socket.id] === this.admin){
        this.adjustSettings(settings);
      }
    });

    socket.on('playerColorSelected', (item) => {
      this.roomSocket.emit('playerColorSelected', item);
    });

    socket.on('playerReady', (name, party) => {
      this.playerNames[socket.id] = name.toString();
      this.players[name] = {name: name, party: party, isReady: true, politicalCapital: this.settings.START_CAPITAL, senators: this.settings.START_SENATORS};
      this.clearSocketRooms(socket, party);
      socket.join(party);
      this.updateAllPlayers();
    });
  }

  omitPlayerFromParty(socket){
    const playerName = this.playerNames[socket.id];
    if (this.players[playerName] && this.players[playerName].party && this.parties && this.parties[this.players[playerName].party] && this.parties[this.players[playerName].party].players){
      if (this.parties[this.players[playerName].party].players.length === 1){
        this.parties = _.omit(this.parties, this.players[playerName].party);
      } else {
        this.parties = _.reject(this.parties[this.players[playerName].party].players, (player) => player === playerName);
      }
    }
  }

  updateAdminIfNeeded(socket){
    if (this.playerNames[socket.id] === this.admin){
      this.updateAdmin(_.keys(this.players).length > 0 ? _.sample(_.values(this.players)).name : '');
    }
  }

  endGameIfNotEnoughPlayers(){
    this.setInGame(false);
    this.roomSocket.emit('closeGame');
    this.deleteRoom(this.roomID);
  }

  updateAllPlayers(){
    this.emitFullGame();
    this.checkDeleteRoom();
    this.updateRoomDetails();
  }

  handlePlayerLeavingRoom(socket){
    socket.on('leaveRoom', () => {
      this.omitPlayerFromParty(socket);
      this.players = _.omit(this.players, this.playerNames[socket.id]);
      this.updateAdminIfNeeded(socket);
      if (_.keys(this.players).length <= 1 && this.inGame){
        this.endGameIfNotEnoughPlayers(socket);
      } else {
        this.updateAllPlayers(socket);
      }
    });
  }

  handleStartingAndClosingGame(socket){
    socket.on('closeGame', () =>  {
      this.endGameIfNotEnoughPlayers(socket);
    });

    socket.on('startGame', () => {
      if (this.playerNames[socket.id] === this.admin){
        this.inGame = true;
        this.roomSocket.emit('startGame');
        this.updateGame();
      }
    });
  }

  handleMiscellaneousCallback(socket){
    socket.on('getFullGame', () =>  {
      this.emitFullGame(socket);
    });

    socket.on('disconnect', () => {
      this.playerNames = _.omit(this.playerNames, socket.id);
      this.checkDeleteRoom();
    });
  }

  handleSocketCallback(socket){
    socket.on('newPlayer', (newPlayer) => {
      this.playerNames[socket.id] = newPlayer.toString();
      if (!_.contains(_.keys(this.players), newPlayer)){
        this.players[this.playerNames[socket.id].toString()] = {name: newPlayer, isReady: false};
      }
      if (_.isEmpty(this.admin)){
        this.updateAdmin(newPlayer);
      }
      this.updateAllPlayers();
      this.updateRoomDetails();
    });

    const handleIdentifyingPlayerLogic = (name, partyNumber, partyName) => {
      if (name){
        this.playerNames[socket.id] = name.toString();
        if (partyNumber && !_.contains(_.keys(socket.rooms), partyNumber)){
          this.clearSocketRooms(socket, partyNumber);
          socket.join(partyNumber);
        }
      }
      this.emitFullGame();
    };

    socket.on('identifyPlayer', handleIdentifyingPlayerLogic);

    this.handleStartingAndClosingGame(socket);
    this.handlePlayerLeavingRoom(socket);
    this.handleIndividualPlayerSettings(socket);
    this.handlePartyNameLogic(socket);
    this.handleGameMechanics(socket);
    this.handleMiscellaneousCallback(socket);
  }
}

GameManager.prototype.id = function() {
	return this.namespace.hashCode();
};

module.exports = GameManager;
