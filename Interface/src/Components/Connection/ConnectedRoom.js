import React, { Component } from 'react'
import Flexbox from 'flexbox-react'

import { colors, allColors, allColorHexes } from '../../styles/colors'
import { svgIcon } from '../../Images/icons'
import ResyncLogo from '../../Images/ResyncLogo.png'

import RaisedButton from 'material-ui/RaisedButton'
import CircularProgress from 'material-ui/CircularProgress'
import IconButton from 'material-ui/IconButton'

import NameDialog from './ConnectionUtils/NameDialog'

import { values, sortWith, ascend, prop, curry, assoc } from 'ramda'

import { _ } from 'underscore'

import { setPlayerName, readyUp, inGame } from '../../State/ServerActions'

const io = require('socket.io-client')

class ConnectedRoom extends Component {
  constructor(props){
    super(props)
    this.colors = colors
    this.allColors = props.allColors || allColors
    this.allColorHexes = props.allColorHexes || allColorHexes
    this.partyType = props.partyType || 'Party'
    this.gameType = props.gameType || 'Tutorial'
    this.state = Object.assign({}, this.propsConst(props), {
      players: [],
      playerColors: {},
    })
  }

  propsConst(props){
    return Object.assign({}, {
      dispatch: props.dispatch,
      disconnect: props.disconnect,
      playerParty: props.playerParty ? props.playerParty : Math.floor(Math.random() * (this.allColors.length)) + 1,
      playerName: props.playerName,
      inGame: props.inGame,
      submitName: props.playerName ? false : true,
      playerReady: props.playerReady,
      startGame: props.inGame,
      hasSeenTabulation: props.hasSeenTabulation,
    }, this.setConnectedRoomProperties(props))
  }

  setConnectedRoomProperties(props){
    if(props.connectedRoom){
      return {
        connectedRoom: props.connectedRoom,
        managingSocket: io(process.env.REACT_APP_POLITICAL_CAPITAL + '/' + props.connectedRoom._id),
      }
    }
    return {}
  }

  componentWillMount(){
    if(this.state.managingSocket){
      this.handleAllSocketConnections()
      this.state.managingSocket.connect()
    }
  }

  handleAllSocketConnections = () => {
    this.state.managingSocket.on('connect', () => {
      this.state.managingSocket.emit('getFullGame')
    })

    this.state.managingSocket.on('updatePlayers', (players) => {
      this.setState({ players: this.sortPlayers(players), playerNames: _.pluck(_.values(players), 'name') })
    })

    this.state.managingSocket.on('allPlayersReady', (canStartGame) => {
      this.setState({ startGame: canStartGame })
    })

    this.state.managingSocket.on('startGame', () => {
      this.startGame()
    })

    const getPlayers = (players) => ({ players: this.sortPlayers(players), playerReady: players[this.state.playerName] ? players[this.state.playerName].isReady : this.state.playerReady, startGame: !_.contains(_.pluck(values(players), 'isReady'), false) })
    const getPlayerNames = (players) => ({ playerNames: _.pluck(_.values(players), 'name') || [] })

    this.state.managingSocket.on('receiveFullGame', (roundInfo) => {
      this.setState(Object.assign({}, !_.isEmpty(roundInfo.players) && getPlayers(roundInfo.players), getPlayerNames(roundInfo.players)), () => {
        if(roundInfo.inGame){
          this.startGame(true)
        }
      })
    })

    this.state.managingSocket.on('playerColorSelected', (playerInfo) => {
      this.setState({ playerColors: assoc(playerInfo.player, playerInfo.color, this.state.playerColors) })
    })

    this.state.managingSocket.on('reconnect', () => {
      this.state.managingSocket.emit('identifyPlayer', this.state.playerName, this.state.playerParty)
    })

    this.state.managingSocket.on('boot', () => {
      this.disconnect()
    })
  }

  componentDidMount(){
    if(this.state.managingSocket){
      if(this.state.playerReady){
        this.state.managingSocket.emit('identifyPlayer', this.state.playerName, this.state.playerParty)
      } else {
        this.state.managingSocket.emit('identifyPlayer', this.state.playerName)
      }
      this.identifySelectedPlayerColor()
    }
  }

  sortPlayers = (players) => {
    const defaultPlayers = _.map(values(players), (player) => _.defaults(player, { party: 7 }))
    return sortWith([ ascend(prop('party')), ascend(prop('name')) ])(defaultPlayers)
  }

  changePlayerParty = (isAddition, event) => {
    let playerParty = this.state.playerParty
    const newPlayerParty = isAddition ? (playerParty < (this.allColors.length) ? ++playerParty : 1) : (playerParty > 1 ? --playerParty : (this.allColors.length))
    this.setState({ playerParty: newPlayerParty }, () => {
      this.state.managingSocket.emit('playerColorSelected', { player: this.state.playerName, color: this.state.playerParty })
    })
  }
  curryChangePlayerParty = curry(this.changePlayerParty)

  readyUp = () => {
    if(this.state.playerName && this.state.playerParty){
      this.state.managingSocket.emit('playerReady', this.state.playerName, this.state.playerParty)
      this.state.dispatch(readyUp(this.state.playerName, this.state.playerParty))
      this.setState({ playerReady: true })
    }
  }

  startGame = (force) => {
    if(!this.state.inGame){
      if(this.state.isAdmin || force){
        this.state.managingSocket.emit('startGame')
      }
      this.setState({ inGame: true }, () => {
        this.state.dispatch(inGame(true))
      })
    }
  }

  disconnect = () => {
    this.state.managingSocket.emit('leaveRoom', this.state.playerName)
    this.state.managingSocket.disconnect()
    this.state.disconnect()
  }

  componentWillReceiveProps(nextProps){
    this.setState(this.propsConst(nextProps))
  }

  componentWillUnmount(){
    this.state.managingSocket.disconnect()
  }

  renderHeaders = () => {
    return(
      <Flexbox flexDirection='column' style={ { marginBottom: '20px' } }>
        <Flexbox flexGrow={ 1 } alignItems='center' flexDirection='column' style={ { marginBottom: '15px' } }>
          <font style={ { fontSize: '25px' } }> Political Capital </font>
          <font> By Resync </font>
        </Flexbox>
        <Flexbox flexGrow={ 1 } alignItems='flex-start'>
          <Flexbox flexDirection='column'>
            <font> { this.gameType } Deck ({ this.state.connectedRoom._id }) </font>
            <font> { this.state.playerName } </font>
          </Flexbox>
          <Flexbox flexGrow={ 1 } justifyContent='flex-end'>
            <IconButton tooltip='Disconnect' onTouchTap={ this.disconnect }>
              { svgIcon('logout', colors.DARK_GRAY) }
            </IconButton>
          </Flexbox>
        </Flexbox>
        <img alt='Reysnc Logo' src={ ResyncLogo } width='20px' height='20px' style={ { position: 'fixed', right: '5px', bottom: '5px' } } />
      </Flexbox>
    )
  }

  renderChangeArrow = (changePlayerParty, icon) => {
    return !this.state.playerReady ? <IconButton id={ icon } onTouchTap={ this.curryChangePlayerParty(changePlayerParty) }> { svgIcon(icon) } </IconButton> : <div />
  }

  renderPartySelectButtonIcon = () => {
    if(this.props.renderPartySelectButtonIcon){
      this.props.renderPartySelectButtonIcon()
    }
  }

  renderPlayerPartyPicker = () => {
    return(
      <Flexbox id='Party Picker' flexDirection='column'>
        <Flexbox id='Container' alignItems='center' justifyContent='center'>
          <Flexbox>
            { this.renderChangeArrow(false, 'arrow_left') }
          </Flexbox>
          <Flexbox flexBasis='75%'>
            <RaisedButton fullWidth={ true } label={ this.allColors[this.state.playerParty - 1] } icon={ this.renderPartySelectButtonIcon() } backgroundColor={ this.allColorHexes[this.state.playerParty - 1] } onTouchTap={ !this.state.playerReady ? this.curryChangePlayerParty(true) : undefined } style={ { width: '20%', margin: '3px' } } />
          </Flexbox>
          <Flexbox>
            { this.renderChangeArrow(true, 'arrow_right') }
          </Flexbox>
        </Flexbox>
      </Flexbox>
    )
  }

  fetchColor = (entry, isName) => {
    const indexOfPartySelection = entry.isReady ? entry.party : this.state.playerColors[entry.name]
    if(indexOfPartySelection){
      return isName ? this.allColors[indexOfPartySelection - 1] : this.allColorHexes[indexOfPartySelection - 1]
    }
    return isName ? 'Selecting' : colors.DARK_GRAY
  }

  renderCurrentPlayer = () => {
    return(
      <Flexbox style={ { marginTop: '20px', marginBottom: '20px' } }>
        <Flexbox flexBasis='50%' flexWrap='wrap' justifyContent='center'>
          <font style={ { textDecoration: 'underline' } }> Selected { this.partyType } </font>
        </Flexbox>
        <Flexbox flexBasis='50%' flexWrap='wrap' justifyContent='center'>
          <font style={ { textDecoration: 'underline' } }> Name </font>
        </Flexbox>
      </Flexbox>
    )
  }

  renderReadyPlayer = (entry) => {
    return this.props.renderReadyPlayer ?
      this.props.renderReadyPlayer(entry)
      :
      (
        <Flexbox flexBasis='50%' flexWrap='wrap' justifyContent='center'>
          <font size={ 4 } color={ colors.DARK_GRAY } style={ entry.isReady ? { fontStyle: 'normal' } : { fontStyle: 'italic' } }>
            <font style={ { marginBottom: '5px', borderBottomWidth: '2px', borderBottomStyle: 'solid', borderBottomColor: this.fetchColor(entry) } }> { this.fetchColor(entry, true) } </font>
            { !entry.isReady && <font>*</font>}
          </font>
        </Flexbox>
      )
  }

  renderPlayersViewTable = () => {
    return(
      <div>
        { this.state.players.map((entry, index) => (
          <Flexbox id={ entry.name } key={ index } flexGrow={ 1 }>
            { this.renderReadyPlayer(entry) }
            <Flexbox flexBasis='50%' flexWrap='wrap' justifyContent='center' alignItems='center'>
              <font size={ 4 } color={ colors.DARK_GRAY }> { entry.name } </font>
            </Flexbox>
          </Flexbox>
        ))
        }
      </div>
    )
  }

  renderPlayerTableWithLoader = () => {
    return (this.state.players.length > 0 ?
      this.renderPlayersViewTable()
      :
      <Flexbox justifyContent='center'>
        <CircularProgress color={ this.colors.DARK_BLUE } />
      </Flexbox>)
  }

  renderPlayers = () => {
    return(
      <Flexbox flexGrow={ 1 } flexDirection='column'>
        { this.renderCurrentPlayer() }
        { this.renderPlayerTableWithLoader() }
      </Flexbox>
    )
  }

  renderReadyButton = () => {
    return(
      <Flexbox flexGrow={ 1 } justifyContent='center' style={ { marginTop: '15px', marginBottom: '15px' } }>
        <Flexbox flexBasis='85%'>
          { (this.state.startGame && this.state.isAdmin) ?
            <RaisedButton fullWidth={ true } primary={ true } label='Proceed To Game' onClick={ this.startGame } disabled={ this.state.players.length <= 1 } style={ { width: '50%', margin: '10px' } } />
            :
            <RaisedButton id='Ready Up' fullWidth={ true } primary={ true } label={ this.state.playerReady ? 'Waiting' : 'Ready' } disabled={ this.state.playerReady } onTouchTap={ this.readyUp } style={ { width: '20%', margin: '3px' } } />
          }
        </Flexbox>
      </Flexbox>
    )
  }

  identifySelectedPlayerColor = () => {
    this.state.managingSocket.emit('playerColorSelected', { player: this.state.playerName, color: this.state.playerParty })
  }

  finalizeJoiningLobby = (playerName) => {
    this.setState({ playerName: playerName }, () => {
      this.state.dispatch(setPlayerName(this.state.playerName))
      this.state.managingSocket.emit('newPlayer', this.state.playerName)
      this.identifySelectedPlayerColor()
    })
  }

  renderSubmitNameDialog = () => {
    return <NameDialog disconnect={ this.disconnect } dispatch={ this.state.dispatch } playerNames={ this.state.playerNames } finalizeJoiningLobby={ this.finalizeJoiningLobby } />
  }

  renderConnectedRoomItems = () => {
    return(
      <div style={ { width: '100%' } }>
        { this.renderHeaders() }
        { this.renderPlayerPartyPicker() }
        { this.renderPlayers() }
        { this.renderReadyButton() }
        { this.state.submitName && this.renderSubmitNameDialog() }
      </div>
    )
  }

  renderBackgroundImage(){
    return(
      <Flexbox>
        Waiting for room connection...
      </Flexbox>
    )
  }

  render() {
    return (
      <Flexbox id='Room Setup' flexDirection='column' flexGrow={ 1 }>
        { this.state.connectedRoom ? this.renderConnectedRoomItems() : this.renderBackgroundImage() }
      </Flexbox>
    )
  }
}

export default ConnectedRoom
