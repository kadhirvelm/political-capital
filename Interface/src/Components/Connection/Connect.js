import React, { Component } from 'react'
import Flexbox from 'flexbox-react'
import { Link } from 'react-router-dom'

import { colors, allColors, allColorHexes } from '../../styles/colors'
import { svgIcon } from '../../Images/icons'

import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'
import Dialog from 'material-ui/Dialog'
import CircularProgress from 'material-ui/CircularProgress'
import IconButton from 'material-ui/IconButton'

import { values, sortWith, ascend, prop, match, curry, assoc } from 'ramda'

import { _ } from 'underscore'

import { setPlayerName, readyUp, inGame, setRooms } from '../../State/ServerActions'

const io = require('socket.io-client')

class PoliticalCapital extends Component {
  constructor(props){
    super(props)
    this.colors = colors
    this.allColors = allColors
    this.allColorHexes = allColorHexes
    this.partyType = 'Party'
    this.gameType = 'Tutorial'
    this.state = {
      dispatch: props.dispatch,
      connectedRoom: props.connectedRoom,
      managingSocket: io(process.env.REACT_APP_POLITICAL_CAPITAL + '/' + props.connectedRoom.roomName),
      disconnect: props.disconnect,
      playerParty: props.playerParty ? props.playerParty : Math.floor(Math.random() * (this.allColors.length)) + 1,
      playerName: props.playerName,
      admin: props.connectedRoom.admin,
      isAdmin: props.playerName === props.connectedRoom.admin,
      inGame: props.inGame,
      submitName: props.playerName ? false : true,
      players: [],
      playerReady: props.playerReady,
      startGame: props.inGame,
      playerColors: {},
      settings: {},
      hasSeenTabulation: props.hasSeenTabulation,
      showSettings: false,
    }
  }

  componentWillMount(){
    this.handleAllSocketConnections()
    this.state.managingSocket.connect()
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
          this.joinLobby()
        }
        if(roundInfo.inGame){
          this.startGame(true)
        }
      })
    })

    this.state.managingSocket.on('updateAdmin', (newAdmin) => {
      this.setState({ connectedRoom: _.extend(this.state.connectedRoom, { admin: newAdmin }), isAdmin: this.state.playerName === newAdmin }, () => {
        this.state.dispatch(setRooms(this.state.connectedRoom, this.state.managingSocket))
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
      this.setState({ error: 'Cannot contain emojis' })
    }
  }

  joinLobby = () => {
    if (this.state.playerName) {
      if(this.state.playerNames){
        if (!_.contains(this.state.playerNames, this.state.playerName)) {
          this.setState({ submitName: false }, () => {
            this.state.dispatch(setPlayerName(this.state.playerName))
            this.state.managingSocket.emit('newPlayer', this.state.playerName)
            this.identifySelectedPlayerColor()
          })
        } else {
          this.setState({ error: 'This name is already taken, please select a different one.' })
        }
      } else {
        this.setState({ error: 'Hang tight, fetching current player names.' })
      }
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

  componentWillUnmount(){
    this.state.managingSocket.disconnect()
  }

  adjustSettings = (key, isIncrease, max, min, event) => {
    const currSettings = this.state.settings
    if(!_.isString(max) && !_.isString(min)){
      let newValue = isIncrease ? ++currSettings[key] : --currSettings[key]
      newValue = Math.min(Math.max(newValue, min), max)
      currSettings[key] = newValue
    } else {
      let newValue = isIncrease ? max : min
      newValue = newValue === currSettings[key] ? (newValue === max ? min : max) : newValue
      currSettings[key] = newValue
    }
    this.setState({ settings: currSettings }, () => {
      this.state.managingSocket.emit('adjustSettings', this.state.settings)
    })
  }

  curryAdjustSettings = curry(this.adjustSettings)

  adjustItem = (name, key, max, min) => {
    return(
      <Flexbox key={ key } alignItems='center'>
        <font style={ !this.state.isAdmin ? { marginRight: '10px' } : {} }> { name } </font>
        { this.state.isAdmin && <IconButton onTouchTap={ this.curryAdjustSettings(key, false, max, min) }> { svgIcon('arrow_left') } </IconButton> }
        <font style={ !this.state.isAdmin ? { maringLeft: '20px', marginRight: '20px' } : {} }> { this.state.settings[key] } </font>
        { this.state.isAdmin && <IconButton onTouchTap={ this.curryAdjustSettings(key, true, max, min) }> { svgIcon('arrow_right') } </IconButton> }
      </Flexbox>
    )
  }

  settings = () => {
    return [
      { name: 'Start Senators', key: 'START_SENATORS', max: 10, min: 1 },
      { name: 'Initial Capital', key: 'START_CAPITAL', max: 120, min: 0 },
      { name: 'Total Rounds', key: 'ROUNDS', max: 10, min: 1 },
      { name: 'Senate Tax', key: 'SENATE_TAX', max: 40, min: 0 },
    ]
  }

  changeShowSettings = () => {
    this.setState({ showSettings: !this.state.showSettings })
  }

  renderHeaders = () => {
    return(
      <Flexbox flexDirection='column'>
        <Flexbox flexGrow={ 1 } alignItems='flex-start'>
          <Flexbox flexDirection='column'>
            <font> { this.gameType } Deck </font>
            <Link to={ '/overview/' + this.state.connectedRoom.roomName } target='blank' style={ { textDecoration: 'none', color: this.colors.LIGHT_BLUE } }> Game Overview </Link>
          </Flexbox>
          <Flexbox flexGrow={ 1 } justifyContent='flex-end'>
            <IconButton tooltip='Disconnect' onTouchTap={ this.disconnect }>
              { svgIcon('logout', colors.DARK_GRAY) }
            </IconButton>
          </Flexbox>
        </Flexbox>
        <Flexbox flexDirection='column' alignItems='center'>
          <font style={ { marginTop: '15px', fontSize: '7vw' } }> <u> { this.state.connectedRoom.roomName.replaceAll('%20', ' ') } </u> </font>
          <Flexbox justifyContent='center' alignItems='baseline' style={ { marginBottom: '15px' } }>
            <font style={ { marginRight: '15px' } } size='2'> { !_.isEmpty(this.state.connectedRoom.password) && 'Password: ' + this.state.connectedRoom.password } </font>
          </Flexbox>
        </Flexbox>
      </Flexbox>
    )
  }

  renderChangeArrow = (changePlayerParty, icon) => {
    return !this.state.playerReady ? <IconButton id={ icon } onTouchTap={ this.curryChangePlayerParty(changePlayerParty) }> { svgIcon(icon) } </IconButton> : <div />
  }

  renderPartySelectButtonIcon = () => undefined

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
    return(
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
              <div style={ { marginLeft: '5px' } }> { entry.name === this.state.connectedRoom.admin && svgIcon('crown') } </div>
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
            <RaisedButton fullWidth={ true } primary={ true } label='Proceed To Game' onTouchTap={ this.startGame } disabled={ this.state.players.length <= 1 } style={ { width: '50%', margin: '10px' } } />
            :
            <RaisedButton id='Ready Up' fullWidth={ true } primary={ true } label={ this.state.playerReady ? (this.state.startGame ? 'Waiting on ' + this.state.admin : 'Waiting on Players') : 'Ready' } disabled={ this.state.playerReady } onTouchTap={ this.readyUp } style={ { width: '20%', margin: '3px' } } />
          }
        </Flexbox>
      </Flexbox>
    )
  }

  renderDetailedSettingsView = () => {
    return this.state.showSettings ?
      <Flexbox id='Settings' style={ { backgroundColor: this.colors.LIGHTEST_GRAY, padding: '5px', borderColor: this.colors.LIGHT_GRAY, borderStyle: 'solid', borderWidth: '1px', borderRadius: '10px' } } flexDirection='column'>
        <Flexbox justifyContent='flex-start' flexGrow={ 1 } style={ { marginBottom: '10px' } }> <font size='2'> Settings </font> </Flexbox>
        <Flexbox id='Settings Holder' flexGrow={ 1 } flexWrap='wrap' justifyContent='space-around' alignItems='flex-end'>
          { this.settings().map((settings, index) => (
            <div id={ index } key={ index }> { this.adjustItem(settings.name, settings.key, settings.max, settings.min) } </div>
          ))
          }
        </Flexbox>
      </Flexbox>
      :
      <div />
  }

  renderSettings = () => {
    return(
      <Flexbox flexDirection='column'>
        <Flexbox flexGrow={ 1 } justifyContent='flex-start' alignItems='baseline'>
          <RaisedButton label={ this.state.showSettings ? 'Hide' : (this.state.isAdmin ? 'Adjust Settings' : 'Show Settings') } primary={ this.state.showSettings } onTouchTap={ this.changeShowSettings } style={ { marginTop: '15px' } } />
          { (this.state.settingsChangeIndicator && !this.state.isAdmin) && <font color={ this.colors.RED } style={ { marginLeft: '15px' } }> Settings changed! </font> }
        </Flexbox>
        { this.renderDetailedSettingsView() }
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
            <TextField id='Name Field' hintText='Player Name' fullWidth={ true } onChange={ this.handleSetPlayerName } value={ this.state.playerName || '' } />
            <Flexbox justifyContent='center'> <font color='red'> { this.state.error || '' } </font> </Flexbox>
          </Dialog>
        }
      </Flexbox>
    )
  }

  render() {
    return (
      <Flexbox id='Room Setup' flexDirection='column' flexGrow={ 1 }>
        { this.renderHeaders() }
        { this.renderPlayerPartyPicker() }
        { this.renderPlayers() }
        { this.renderReadyButton() }
        { this.renderSettings() }
        { this.renderSubmitNameDialog() }
      </Flexbox>
    )
  }
}

export default PoliticalCapital
