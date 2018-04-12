import React, { Component } from 'react'
import Flexbox from 'flexbox-react'

import { colors, allColors, allColorHexes } from '../../styles/colors'
import { svgIcon } from '../../Images/icons'
import ResyncLogo from '../../Images/ResyncLogo.png'

import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'
import Dialog from 'material-ui/Dialog'
import CircularProgress from 'material-ui/CircularProgress'
import IconButton from 'material-ui/IconButton'

import { values, sortWith, ascend, prop, match, curry, assoc } from 'ramda'

import { _ } from 'underscore'

import { setPlayerName, readyUp, inGame } from '../../State/ServerActions'
import { NameGeneratorContext } from './Catalog.js'

const io = require('socket.io-client')

class ConnectedRoom extends Component {
  constructor(props){
    super(props)
    this.colors = colors
    this.allColors = props.allColors || allColors
    this.allColorHexes = props.allColorHexes || allColorHexes
    this.partyType = props.partyType || 'Party'
    this.gameType = props.gameType || 'Tutorial'
    this.nameGeneratorContext = new NameGeneratorContext(this, this.resetNameFieldOnEmpty)
    this.state = this.propsConst(props)
  }

  propsConst(props){
    return Object.assign({}, {
      dispatch: props.dispatch,
      disconnect: props.disconnect,
      playerParty: props.playerParty ? props.playerParty : Math.floor(Math.random() * (this.allColors.length)) + 1,
      playerName: props.playerName || this.nameGeneratorContext.randomName,
      inGame: props.inGame,
      submitName: props.playerName ? false : true,
      players: [],
      playerReady: props.playerReady,
      startGame: props.inGame,
      playerColors: {},
      settings: {},
      hasSeenTabulation: props.hasSeenTabulation,
      showSettings: false,
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

  resetNameFieldOnEmpty = () => {
    this.setState({ playerName: this.nameGeneratorContext.randomName })
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
    const getSettings = (settings) => ({ settings: settings })

    this.state.managingSocket.on('receiveFullGame', (roundInfo) => {
      this.setState(Object.assign({}, !_.isEmpty(roundInfo.players) && getPlayers(roundInfo.players), getPlayerNames(roundInfo.players), getSettings(roundInfo.settings)), () => {
        if(this.state.playerName && !_.contains(this.state.playerNames, this.state.playerName)){
          this.joinLobby(this.state.isAdmin)
        }
        if(roundInfo.inGame){
          this.startGame(true)
        }
      })
    })

    this.state.managingSocket.on('updatedSettings', (newSettings) => {
      this.setState({ settings: newSettings, settingsChangeIndicator: true })
    })

    this.state.managingSocket.on('playerColorSelected', (playerInfo) => {
      this.setState({ playerColors: assoc(playerInfo.player, playerInfo.color, this.state.playerColors) })
    })

    this.state.managingSocket.on('reconnect', () => {
      if(this.state.playerReady && this.state.playerParty){
        this.state.managingSocket.emit('identifyPlayer', this.state.playerName, this.state.playerParty)
      }
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

  identifySelectedPlayerColor = () => {
    this.state.managingSocket.emit('playerColorSelected', { player: this.state.playerName, color: this.state.playerParty })
  }

  handleSetPlayerName = (event) => {
    if(match(/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g, event.target.value).length === 0){
      this.setState({ playerName: event.target.value.trimLeft(), error: '' })
    } else {
      this.setState({ error: 'Name cannot contain emojis.' })
    }
  }

  finalizeJoiningLobby = () => {
    this.state.dispatch(setPlayerName(this.state.playerName))
    this.state.managingSocket.emit('newPlayer', this.state.playerName)
    this.identifySelectedPlayerColor()
  }

  checkForNameUniqueness = () => {
    if (!_.contains(this.state.playerNames, this.state.playerName)) {
      this.setState({ submitName: false }, this.finalizeJoiningLobby)
    } else {
      this.setState({ error: 'This name is already taken, please select a different one.' })
    }
  }

  ableToJoinLobby = () => {
    if(this.state.playerNames){
      this.checkForNameUniqueness()
    } else {
      this.setState({ error: 'Hang tight, fetching current player names.' })
    }
  }

  joinLobby = (playerSubmitted = true) => {
    if (playerSubmitted && this.state.playerName !== this.nameGeneratorContext.randomName) {
      this.ableToJoinLobby(playerSubmitted)
    } else if (playerSubmitted) {
      this.setState({ error: 'Please enter a name, a title is not enough.' })
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
      this.setState({ playerReady: true, settingsChangeIndicator: false })
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
    this.state.managingSocket.emit('leaveRoom')
    this.state.managingSocket.disconnect()
    this.state.disconnect()
  }

  componentWillReceiveProps(nextProps){
    this.setState(this.propsConst(nextProps))
  }

  componentWillUnmount(){
    this.state.managingSocket.disconnect()
  }

  changeShowSettings = () => {
    this.setState({ showSettings: !this.state.showSettings })
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
            <font> { this.gameType } Deck </font>
            <font> Room ID: <b> { this.state.connectedRoom._id } </b> </font>
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
            <RaisedButton id='Ready Up' fullWidth={ true } primary={ true } label={ this.state.playerReady ? (this.state.startGame ? 'Waiting on ' + this.state.admin : 'Waiting on Players') : 'Ready' } disabled={ this.state.playerReady } onTouchTap={ this.readyUp } style={ { width: '20%', margin: '3px' } } />
          }
        </Flexbox>
      </Flexbox>
    )
  }

  renderSubmitNameDialog = () => {
    const actions = [ <RaisedButton key='Cancel' label='Cancel' secondary={ true } onTouchTap={ this.disconnect } style={ { marginRight: '10px' } } />, <RaisedButton id='Join' key='Join' label='Join!' primary={ true } onTouchTap={ this.joinLobby } /> ]
    return(
      <Flexbox>
        { this.state.submitName &&
          <Dialog title='Player Name' id='Name' actions={ actions } modal={ true } open={ this.state.submitName } autoDetectWindowHeight={ false } repositionOnUpdate={ false }>
            <font> Type in your name so others can see you. Note: this cannot be changed once set. </font>
            <TextField id='Name Field' hintText='Player Name' fullWidth={ true } onChange={ this.handleSetPlayerName } onFocus={ this.nameGeneratorContext.removeDefaultName } onBlur={ this.nameGeneratorContext.onFocusHandler } value={ this.state.playerName } />
            <Flexbox justifyContent='center'> <font color='red'> { this.state.error || '' } </font> </Flexbox>
          </Dialog>
        }
      </Flexbox>
    )
  }

  renderConnectedRoomItems = () => {
    return(
      <div style={ { width: '100%' } }>
        { this.renderHeaders() }
        { this.renderPlayerPartyPicker() }
        { this.renderPlayers() }
        { this.renderReadyButton() }
        { this.renderSubmitNameDialog() }
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
