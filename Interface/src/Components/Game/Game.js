import React, { Component } from 'react'
import Flexbox from 'flexbox-react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import ResolutionAndChance from './ResolutionAndChance'
import PartyCards from './PartyCards'

import EndGame from '../OutsideGame/EndGame'

import Vote from './Util/Vote'
import EndRoundLogistics from './Util/EndRoundLogistics'
import Tools from './Util/Tools'
import PlayerValues from './Util/PlayerValues'

import CircularProgress from 'material-ui/CircularProgress'
import Dialog from 'material-ui/Dialog'
import RaisedButton from 'material-ui/RaisedButton'
import IconButton from 'material-ui/IconButton'
import TextField from 'material-ui/TextField'
import Snackbar from 'material-ui/Snackbar'

import { _ } from 'underscore'
import { colors } from '../../styles/colors'
import '../../styles/Transitions.css'
import { svgIcon } from '../../Images/icons'

import { finalizePartyName, readyUp } from '../../State/ServerActions'

import { match } from 'ramda'

// import Sound from 'react-sound'

const io = require('socket.io-client')

class PoliticalCapitalGame extends Component {
  constructor(props){
    super(props)
    this.state = Object.assign({}, this.propsConst(props), this.baseStateSettings(props))
  }

  baseStateSettings = (props) => {
    return {
      managingSocket: io(process.env.REACT_APP_POLITICAL_CAPITAL + '/' + props.connectedRoom.roomName),
      rounds: {},
      players: {},
      parties: {},
      currentRound: 0,
      selectedPartyCard: {},
      currentlyViewingResults: false,
      firstFetchedGame: false,
      openTools: false,
      openBribe: false,
      bribeSentOut: false,
      preventAllSounds: false,
    }
  }

  propsConst(props){
    return({
      dispatch: props.dispatch,
      connectedRoom: props.connectedRoom,
      isAdmin: props.connectRoom && (props.playerName === props.connectedRoom.admin),
      disconnect: props.disconnect,

      playerName: props.playerName,
      playerParty: props.playerParty,
      playerPartyName: (this.state && this.state.playerPartyName) || props.playerPartyName || '',
      hasSeenTabulation: props.hasSeenTabulation,
    })
  }

  componentWillMount(){
    this.state.managingSocket.connect()
    if(!this.state.playerPartyName){
      this.setState({ firstFetchedGame: true })
    }
  }

  identifyPlayer = () => {
    this.state.managingSocket.emit('identifyPlayer', this.state.playerName, this.state.playerParty, this.state.playerPartyName)
    if(_.isEmpty(this.state.playerPartyName)){
      this.state.managingSocket.emit('getInitialPartyName', this.state.playerParty)
    }
  }

  componentDidMount(){
    this.handleSocketConnections()
    this.identifyPlayer()
  }

  componentWillUnmount(){
    this.state.managingSocket.disconnect()
  }

  componentWillReceiveProps(nextProps){
    this.setState(this.propsConst(nextProps))
  }

  /**
   * Socket round logic handlers
   */

  fetchPlayerPartyAndPlayerPartyName = (gameInfo) => {
    const playerParty = gameInfo.players[this.state.playerName].party
    const playerPartyName = this.state.playerPartyName || (!_.isUndefined(gameInfo.parties[playerParty]) && gameInfo.parties[playerParty].partyName) || ''
    if(playerParty && playerPartyName){
      this.state.dispatch(readyUp(this.state.playerName, playerParty))
      this.state.dispatch(finalizePartyName(playerPartyName))
    }
    return { playerPartyName: playerPartyName, playerParty: playerParty }
  }

  receivedFullGame = (gameInfo) => {
    this.setState(Object.assign({}, this.updateAllRounds(gameInfo.rounds), this.updateAllPlayers(gameInfo.players), this.updateAllParties(gameInfo.parties), this.updateCurrentRound(gameInfo.currentRound), { firstFetchedGame: true }), () => {
      if(gameInfo.endGame){
        this.handleEndGame(gameInfo.endGame)
      }
    })
  }

  handleReceivingFullGameLogic = () => {
    this.state.managingSocket.on('receiveFullGame', (gameInfo) => {
      this.setState(this.fetchPlayerPartyAndPlayerPartyName(gameInfo), () => {
        this.receivedFullGame(gameInfo)
      })
    })
  }

  handlePartyNameLogic = () => {
    this.state.managingSocket.on('getPartyName', (name) => {
      if(_.isUndefined(this.state.playerPartyName) || !this.state.playerPartyName.includes(name)){
        this.setState({ playerPartyName: name })
      }
    })

    this.state.managingSocket.on('finalizePartyName', (partyName) => {
      this.setState({ playerPartyName: partyName }, () => {
        this.state.dispatch(finalizePartyName(this.state.playerPartyName))
      })
    })

    this.state.managingSocket.on('allPartyNamesSet', (parties) => {
      this.setState(this.updateAllParties(parties))
    })
  }

  updateCurrentRoundDetailsWithGameInfo = (gameInfo) => {
    this.setState(Object.assign({}, this.updateAllRounds(gameInfo.rounds), this.updateAllPlayers(gameInfo.players), this.updateAllParties(gameInfo.parties), this.updateCurrentRound(gameInfo.currentRound)))
  }

  handleRoundUpdatingLogic = () => {
    this.state.managingSocket.on('updateRound', (rounds) => {
      this.setState(this.updateAllRounds(rounds))
    })

    this.state.managingSocket.on('nextRound', (gameInfo) => {
      this.updateCurrentRoundDetailsWithGameInfo(gameInfo)
    })

    this.state.managingSocket.on('updateCurrentRoundDetails', (gameInfo) => {
      this.setState(Object.assign({}, this.updateAllRounds(gameInfo.rounds), this.updateCurrentRound(gameInfo.currentRound)))
    })

    this.state.managingSocket.on('allVotingFinalized', (gameInfo) => {
      this.setState(this.updateAllRounds(gameInfo.rounds))
    })
  }

  handlePartyCardLogic = () => {
    this.state.managingSocket.on('receivePartyCards', (gameInfo) => {
      this.setState(Object.assign({}, this.updateAllParties(gameInfo.parties), this.updateSelectedPartyCard(gameInfo.selectedPartyCard)))
    })

    this.state.managingSocket.on('selectPartyCard', (partyCard) => {
      this.setState({ selectedPartyCard: partyCard })
    })

    this.state.managingSocket.on('finalizePartyCard', (rounds) => {
      this.setState(this.updateAllRounds(rounds))
    })

    this.state.managingSocket.on('allPartiesSelectedPartyCard', (gameInfo) => {
      this.updateCurrentRoundDetailsWithGameInfo(gameInfo)
    })
  }

  handleStartingAndStoppingGame = () => {
    this.state.managingSocket.on('endGame', (gameInfo) => {
      this.handleEndGame(gameInfo)
    })

    this.state.managingSocket.on('closeGame', () => {
      this.state.disconnect()
    })
  }

  handleDisconnectAndReconnectSockets = () => {
    this.state.managingSocket.on('disconnect', (reason) => { })

    this.state.managingSocket.on('error', (reason) => {
      this.state.managingSocket.open()
      if(reason === 'Invalid namespace'){
        this.state.disconnect()
      }
    })

    this.state.managingSocket.on('reconnect_error', (reason) => { })

    this.state.managingSocket.on('reconnect_failed', () => { })

    this.state.managingSocket.on('reconnect', () => {
      this.identifyPlayer()
      this.state.managingSocket.emit('getFullGame')
    })
  }

  handleBribingLogic = () => {
    this.state.managingSocket.on('bribeSentOut', (bribeAmount) => {
      this.changePlaySound(true, bribeAmount)
    })
  }

  handleSocketConnections(){
    this.handleReceivingFullGameLogic()
    this.handlePartyNameLogic()
    this.handleRoundUpdatingLogic()
    this.handlePartyCardLogic()
    this.handleStartingAndStoppingGame()
    this.handleDisconnectAndReconnectSockets()
    this.handleBribingLogic()
  }

  /**
   * State settings components
   */

  handleEndGame = (gameInfo) => {
    this.setState({ endGame: gameInfo })
  }

  updateAllRounds = (rounds) => {
    return { rounds: rounds }
  }

  updateAllPlayers = (players) => {
    return { players: players }
  }

  updateAllParties = (parties) => {
    return { parties: parties }
  }

  updateSelectedPartyCard = (selectedPartyCard) => {
    return { selectedPartyCard: selectedPartyCard }
  }

  updateCurrentRound = (currentRoundNumber) => {
    return { currentRound: currentRoundNumber }
  }

  /**
   * Party name setting logic
   */

  handleFinalizingPartyName = () => {
    if(!_.contains(_.map(_.omit(this.state.parties, this.state.playerParty), _.property('partyName')), this.state.playerPartyName)){
      this.state.managingSocket.emit('finalizePartyName', this.state.playerPartyName)
      this.state.dispatch(finalizePartyName(this.state.playerPartyName))
    } else {
      this.setState({ errorName: 'That name is already taken' })
    }
  }

  finalizePartyName = () => {
    if(this.state.playerPartyName){
      this.handleFinalizingPartyName()
    } else {
      this.setState({ errorName: 'Cannot be blank' })
    }
  }

  adjustPartyName = (event) => {
    if(match(/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g, event.target.value).length === 0){
      this.state.managingSocket.emit('setPartyName', event.target.value.trimLeft())
      this.setState({ playerPartyName: event.target.value.trimLeft(), errorName: '' })
    } else {
      this.setState({ errorName: 'No emojis allowed' })
    }
  }

  hasPlacedPartyCard = () => {
    if(this.state.rounds && this.state.currentRound && this.state.rounds[this.state.currentRound] && !_.isEmpty(this.state.parties)) {
      return _.keys(this.state.rounds[this.state.currentRound].partyCards).length === _.keys(this.state.parties).length
    }
    return false
  }

  handleEndRound = () => {
    if(this.state.rounds && this.state.currentRound){
      return (!_.isEmpty(this.state.rounds[this.state.currentRound].totalVotes) || this.state.currentlyViewingResults)
    }
    return false
  }

  changeCurrentlyViewingResults = () => {
    this.setState({ currentlyViewingResults: !this.state.currentlyViewingResults, selectedPartyCard: '' })
  }

  hasNotSubmittedPartyName = () => {
    if(!_.isEmpty(this.state.parties)){
      return !_.contains(_.flatten(_.pluck(_.values(this.state.parties), 'players')), this.state.playerName)
    }
    return true
  }

  allPartiesSubmitted = () => {
    if(this.state.firstFetchedGame && !this.hasNotSubmittedPartyName()){
      return _.flatten(_.pluck(_.values(this.state.parties), 'players')).length >= _.values(this.state.players).length
    }
    return !this.state.firstFetchedGame
  }

  partyCardProps = () => {
    return {
      id: 'PartyCards',
      dispatch: this.state.dispatch,
      managingSocket: this.state.managingSocket,
      parties: this.state.parties,
      round: this.state.rounds[this.state.currentRound],
      playerParty: this.state.playerParty,
      playerPartyName: this.state.playerPartyName,
      selectedPartyCard: this.state.selectedPartyCard,
    }
  }
  partyCards = () => <PartyCards { ...this.partyCardProps() } />

  renderEndGame = () => {
    return (
      <Flexbox id='End Game' key='End Game' flexGrow={ 1 }>
        <EndGame dispatch={ this.state.dispatch } endGame={ this.state.endGame } disconnect={ this.state.disconnect } hasSeenTabulation={ this.state.hasSeenTabulation } />
      </Flexbox>
    )
  }

  renderEndRoundLogistics = () => {
    return(
      <Flexbox id='End round' key='End Round' flexDirection='column'>
        <EndRoundLogistics dispatch={ this.state.dispatch } managingSocket={ this.state.managingSocket } rounds={ this.state.rounds } currentRound={ this.state.currentRound }
          parties={ this.state.parties } players={ this.state.players } changeCurrentlyViewingResults={ this.changeCurrentlyViewingResults }
          playerName={ this.state.playerName } />
      </Flexbox>
    )
  }

  renderResolutionAndChangeProps = () => {
    return {
      managingSocket: this.state.managingSocket,
      round: this.state.rounds[this.state.currentRound],
      currentRound: this.state.currentRound,
    }
  }

  resolutionAndChance = () => {
    return (
      <Flexbox justifyContent='center'>
        <ResolutionAndChance { ...this.renderResolutionAndChangeProps() } />
      </Flexbox>
    )
  }

  renderPlayerValues = () => {
    return (this.state.players && this.state.playerName && this.state.playerPartyName) ? <PlayerValues id='Player Values' players={ this.state.players } playerName={ this.state.playerName } round={ this.state.rounds[this.state.currentRound] } playerPartyName={ this.state.playerPartyName } /> : <div />
  }

  renderVoteOrPartyCardSelection = () => {
    return(
      <ReactCSSTransitionGroup
        id='CSS Transition'
        transitionName='fade-wait'
        transitionEnterTimeout={ 500 }
        transitionLeaveTimeout={ 500 }
      >
        <Flexbox id='Container' key={ this.hasPlacedPartyCard() ? 'Vote' : 'PartyCards' } flexGrow={ 1 } justifyContent='center'>
          { this.hasPlacedPartyCard() ?
            <Vote id='Vote' players={ this.state.players } playerName={ this.state.playerName } playerPartyName={ this.state.playerPartyName } round={ this.state.rounds[this.state.currentRound] }
              dispatch={ this.state.dispatch } managingSocket={ this.state.managingSocket } />
            :
            this.partyCards()
          }
        </Flexbox>
      </ReactCSSTransitionGroup>
    )
  }

  renderCurrentRoundView = () => {
    return(
      <div id='Resolution and Chance' key='Resolution and Chance'>
        { this.resolutionAndChance() }
        <Flexbox id='Player Values and Vote/PartyCard' flexGrow={ 1 } flexDirection='column' alignItems='center'>
          { this.renderPlayerValues() }
          { this.renderVoteOrPartyCardSelection() }
        </Flexbox>
      </div>
    )
  }

  currentGameState = () => {
    if(this.state.endGame && this.state.endGame.finalWinners){
      return this.renderEndGame()
    } else if (this.handleEndRound()){
      return this.renderEndRoundLogistics()
    } else if(this.state.rounds && this.state.currentRound){
      return this.renderCurrentRoundView()
    }
  }

  returnRegisteredParties = () => {
    return _.keys(_.filter(this.state.parties, (party) => !_.isEmpty(party.players))).length
  }

  renderPartyNameSetDialog = () => {
    return (
      <Dialog id='Party Name Dialog' title='Set Party Name' modal={ true } open={ !this.allPartiesSubmitted() } autoDetectWindowHeight={ false } repositionOnUpdate={ false } style={ { zIndex: 3 } } contentStyle={ { zIndex: 3 } } overlayStyle={ { zIndex: 2 } }>
        <Flexbox flexDirection='column'>
          <Flexbox flexBasis='auto' justifyContent='center' style={ { margin: '7px' } }>
            <TextField id='PartyName' value={ this.state.playerPartyName || '' } label='Party Name' floatingLabelText='Party Name'
              disabled={ !this.hasNotSubmittedPartyName() } onChange={ this.adjustPartyName } errorText={ this.state.errorName || '' } />
          </Flexbox>
          <Flexbox alignItems='center'>
            <Flexbox flexGrow={ 1 } alignItems='center'>
              <RaisedButton primary={ true } label='Submit' disabled={ !this.hasNotSubmittedPartyName() } onClick={ this.finalizePartyName } fullWidth={ true } />
            </Flexbox>
            <Flexbox alignItems='center' justifyContent='flex-end'>
              <IconButton tooltip='Disconnect' onTouchTap={ this.openTryingToDisconnect }>
                { svgIcon('logout', colors.RED) }
              </IconButton>
            </Flexbox>
          </Flexbox>
          <Flexbox flexGrow={ 1 } justifyContent='center' style={ { marginTop: '10px' } }>
            <font> { this.returnRegisteredParties() } Parties Registered </font>
          </Flexbox>
        </Flexbox>
      </Dialog>
    )
  }

  openTryingToDisconnect = () => this.setState({ tryingToDisconnect: true })
  closeTryingToDisconnect = () => this.setState({ tryingToDisconnect: false })
  confirmDisconnect = () => {
    this.setState({ tryingToDisconnect: false }, () => {
      if(this.state.isAdmin){
        this.state.managingSocket.emit('closeGame')
      } else {
        this.state.managingSocket.emit('leaveRoom')
      }
      this.state.disconnect()
    })
  }

  changeDrawer = (open) => {
    this.setState({ openTools: open })
  }
  openDrawer = () => this.changeDrawer(!this.state.openTools)

  closeBribe = () => this.setState({ openBribe: false })
  openBribe = () => this.setState({ openBribe: true })

  changePlaySound = (isTrue, bribeAmount) => {
    this.setState({ playSound: isTrue || false })
    if(isTrue){
      this.openBribeSentOut(bribeAmount)
    }
  }

  openBribeSentOut = (bribeAmount) => {
    this.setState({ bribeSentOut: true, bribeAmount: bribeAmount })
  }

  closeBribeSentOut = () => {
    this.setState({ bribeSentOut: false, bribeAmount: '' })
  }

  cut = (string) => {
    return !_.isEmpty(string) ? (string.length > 20 ? string.substring(0, 20) + '...' : string) : 0
  }

  currentGameStateText = () => {
    if(this.state.endGame && this.state.endGame.finalWinners){
      return 'Game Results'
    } else if (this.handleEndRound()){
      return 'Round Results'
    } else if(this.state.rounds && this.state.currentRound){
      if(this.hasPlacedPartyCard()){
        return 'Voting'
      }
      return 'Party Cards'
    }
  }

  askForFullGame = () => {
    this.state.managingSocket.emit('getFullGame')
  }

  renderNameAndParty = () => {
    return(
      <Flexbox flexBasis='50%' flexDirection='column' alignItems='flex-end'>
        <font> { this.cut(this.state.playerName) } </font>
        <font size={ 2 }> { this.state.playerPartyName && this.cut(this.state.playerPartyName) } </font>
      </Flexbox>
    )
  }

  toolsProps = () => {
    return {
      managingSocket: this.state.managingSocket,
      rounds: this.state.rounds,
      parties: this.state.parties,
      players: this.state.players,
      playerName: this.state.playerName,
      playerParty: this.state.playerParty,
      playerPartyName: this.state.playerPartyName,
      connectedRoom: this.state.connectedRoom,
      currentRound: this.state.currentRound,
      openTryingToDisconnect: this.openTryingToDisconnect,
    }
  }

  renderToolsComponent = () => <Tools { ...this.toolsProps() } />

  renderTools = () => {
    return(
      <Flexbox alignItems='flex-start' style={ { marginBottom: '10px' } }>
        <Flexbox flexGrow={ 1 } justifyContent='flex-start' alignItems='center'>
          { this.renderToolsComponent() }
          <Flexbox flexGrow={ 1 } justifyContent='flex-start'> <font size={ 4 } color={ colors.LIGHT_GRAY }> { this.currentGameStateText() } </font> </Flexbox>
        </Flexbox>
        { this.renderNameAndParty() }
      </Flexbox>
    )
  }

  renderCurrentGameState = () => {
    return(
      <Flexbox id='Game State' flexDirection='column' alignItems='center' flexGrow={ 1 }>
        { (this.state.firstFetchedGame && !_.isUndefined(this.state.playerName) && !_.isUndefined(this.state.playerParty) && !_.isUndefined(this.state.playerPartyName)) ?
          <ReactCSSTransitionGroup
            id='CSS Transition'
            transitionName='fade-fast'
            transitionEnterTimeout={ 500 }
            transitionLeaveTimeout={ 500 }
          >
            { this.currentGameState() }
          </ReactCSSTransitionGroup>
          :
          <Flexbox id='1' flexDirection='column' justifyContent='center' alignItems='center' flexGrow={ 1 } style={ { height: '200px' } }>
            { (this.state.playerPartyName || this.allPartiesSubmitted()) && <CircularProgress color={ colors.DARK_BLUE } style={ { marginBottom: '15px' } } /> }
            { (this.state.playerName && this.allPartiesSubmitted() && (!this.state.playerParty || !this.state.playerPartyName)) && <RaisedButton label='Refresh' primary={ true } onTouchTap={ this.askForFullGame } /> }
          </Flexbox>
        }
      </Flexbox>
    )
  }

  renderAllDialogs = () => {
    const actions = [ <RaisedButton key='Cancel' label='Cancel' primary={ true } onTouchTap={ this.closeTryingToDisconnect } style={ { marginRight: '10px' } } />, <RaisedButton key='Disconnect' label='Disconnect' onTouchTap={ this.confirmDisconnect } /> ]
    return(
      <Flexbox flexGrow={ 1 }>
        <Dialog open={ this.state.tryingToDisconnect || false } onRequestClose={ this.closeTryingToDisconnect } title={ (this.state.isAdmin ? 'Admin ' : '') + 'Disconnect' }
          actions={ actions } style={ { zIndex: 5 } } contentStyle={ { zIndex: 5 } } overlayStyle={ { zIndex: 4 } }>
          <Flexbox flexDirection='column'>
            <font> Are you sure you want to disconnect? { this.state.isAdmin ? <b> This will end the game for everyone. </b> : <font> The game will go on without you. </font> } </font>
          </Flexbox>
        </Dialog>
        { !this.allPartiesSubmitted() && this.renderPartyNameSetDialog() }
      </Flexbox>
    )
  }

  renderOtherComponents = () => {
    return(
      <Snackbar open={ this.state.bribeSentOut } message={'Bribe sent out for ' + this.state.bribeAmount + ' political capital'} autoHideDuration={ 5000 } onRequestClose={ this.closeBribeSentOut } />
    )
  }

  render() {
    return (
      <Flexbox id='Political Capital Game' flexDirection='column'>
        { this.renderTools() }
        { this.renderCurrentGameState() }
        { this.renderAllDialogs() }
        { /* this.state.playSound && <Sound url='https://s3-us-west-1.amazonaws.com/political-capital/cha-ching.mp3' playStatus={ 'PLAYING' } onFinishedPlaying={ this.changePlaySound } /> -- Errors on Safari 11 with autoplay */ }
        { this.renderOtherComponents() }
      </Flexbox>
    )
  }
}

export default PoliticalCapitalGame
