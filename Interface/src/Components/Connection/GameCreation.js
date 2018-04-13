import React, { Component } from 'react'
import Flexbox from 'flexbox-react'
import { resetEverything, inGame } from '../../State/ServerActions'
import RaisedButton from 'material-ui/RaisedButton'
import IconButton from 'material-ui/IconButton'
import '../../styles/global.css'
import { svgIcon } from '../../Images/icons'
import ResyncLogo from '../../Images/ResyncLogo.png'

import { colors, allColors, allColorHexes } from '../../styles/colors'

import { _ } from 'underscore'
import { curry } from 'ramda'

const io = require('socket.io-client')

class GameCreation extends Component {
  constructor(props){
    super(props)
    this.colors = colors
    this.allColors = props.allColors || allColors
    this.allColorHexes = props.allColorHexes || allColorHexes
    this.state = Object.assign({}, this.propsConst(this.props), {
      hasHovered: false,
      startGame: false,
    })
  }

  propsConst(props){
    return {
      dispatch: props.dispatch,
      connectedRoom: props.connectedRoom || (this.state && this.state.connectedRoom),
      isCreatingRoom: _.isUndefined(props.connectedRoom),
    }
  }

  resetToHome = () => {
    this.state.dispatch(resetEverything())
  }

  componentWillReceiveProps(nextProps){
    this.setState(this.propsConst(nextProps), () => {
      this.handleAllSocketConnections()
    })
  }

  componentWillMount(){
    this.handleAllSocketConnections()
  }

  checkIfAllPlayersAreReady(players){
    return Object.values(players).filter((player) => !player.isReady).length === 0
  }

  handleAllSocketConnections = () => {
    if(this.props.connectedRoom && !this.state.managingSocket){
      this.setState({ managingSocket: io(process.env.REACT_APP_POLITICAL_CAPITAL + '/' + this.props.connectedRoom._id) }, () => {
        this.state.managingSocket.emit('getFullGame')

        this.state.managingSocket.on('receiveFullGame', (fullGame) => {
          this.setState({ fullGame: fullGame, startGame: this.checkIfAllPlayersAreReady(fullGame.players) })
        })

        this.state.managingSocket.on('boot', () => {
          this.resetToHome()
        })
      })
    }
  }

  removeHoverMeIndicator = () => {
    if(!this.state.hasHovered){
      this.setState({ hasHovered: true })
    }
  }

  renderRoomID = () => {
    return <Flexbox className={ 'room-identifier ' + (this.state.hasHovered ? '' : 'hover-me-indicator') } onMouseOver={ this.removeHoverMeIndicator } alignItems='center'> <font className='hide-me-on-increase' style={ { marginRight: '5px' } }> Room ID: </font> <font className='increase-size'> { this.state.connectedRoom && this.state.connectedRoom._id } </font> </Flexbox>
  }

  renderCancelAndRoomIdentifier = () => {
    return(
      <Flexbox style={ { position: 'absolute' } } flexDirection='column'>
        <RaisedButton label={ (<h2> Cancel </h2>) } onClick={ this.resetToHome } style={ { width: '5vw', height: '5vh' } } labelStyle={ { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' } } />
        { this.renderRoomID() }
      </Flexbox>
    )
  }

  renderMainTitle(){
    return(
      <Flexbox flexDirection='column' flexGrow={ 1 } alignItems='center'>
        <Flexbox flexGrow={ 1 } alignItems='center' flexDirection='column' style={ { marginBottom: '15px' } }>
          <font style={ { fontSize: '7vw' } }> Political Capital </font>
          <font style={ { fontSize: '5vw', marginTop: '-4vh' } }> By Resync </font>
        </Flexbox>
      </Flexbox>
    )
  }

  /** Settings Table */

  adjustSettings = (key, isIncrease, max, min, event) => {
    const currSettings = this.state.fullGame.settings
    if(!_.isString(max) && !_.isString(min)){
      let newValue = isIncrease ? ++currSettings[key] : --currSettings[key]
      newValue = Math.min(Math.max(newValue, min), max)
      currSettings[key] = newValue
    } else {
      let newValue = isIncrease ? max : min
      newValue = newValue === currSettings[key] ? (newValue === max ? min : max) : newValue
      currSettings[key] = newValue
    }
    this.setState({ fullGame: Object.assign({}, this.state.fullGame, { settings: currSettings }) }, () => {
      this.state.managingSocket.emit('adjustSettings', this.state.fullGame.settings)
    })
  }
  curryAdjustSettings = curry(this.adjustSettings)

  adjustItem = (name, key, max, min) => {
    return(
      <Flexbox key={ key } alignItems='center'>
        <font style={ { fontSize: '2vw', marginRight: '10px' } }> { name } </font>
        <IconButton onTouchTap={ this.curryAdjustSettings(key, false, max, min) }> { svgIcon('arrow_left') } </IconButton>
        <font style={ { fontSize: '2vw', marginLeft: '20px', marginRight: '20px' } }> { this.state.fullGame.settings[key] } </font>
        <IconButton onTouchTap={ this.curryAdjustSettings(key, true, max, min) }> { svgIcon('arrow_right') } </IconButton>
      </Flexbox>
    )
  }

  settings = () => {
    return (this.props.settings && this.props.settings()) || [
      { name: 'Start Senators', key: 'START_SENATORS', max: 10, min: 1 },
      { name: 'Initial Capital', key: 'START_CAPITAL', max: 120, min: 0 },
      { name: 'Total Rounds', key: 'ROUNDS', max: 10, min: 1 },
      { name: 'Senate Tax', key: 'SENATE_TAX', max: 40, min: 0 },
    ]
  }

  renderDetailedSettingsView = () => {
    return (
      <Flexbox id='Settings' style={ { backgroundColor: '#FDEBD0', padding: '5px', borderColor: '#F8C471', borderStyle: 'solid', borderWidth: '1px', borderRadius: '10px', height: '50vh' } } flexDirection='column'>
        <Flexbox justifyContent='center'> <h2> { this.state.fullGame.gameType } Deck Settings </h2> </Flexbox>
        <Flexbox id='Settings Holder' flexGrow={ 1 } flexWrap='wrap' justifyContent='space-around' alignItems='center'>
          { this.settings().map((settings, index) => (
            <div id={ index } key={ index }> { this.adjustItem(settings.name, settings.key, settings.max, settings.min) } </div>
          ))
          }
        </Flexbox>
      </Flexbox>
    )
  }

  /** Player Table */

  bootPlayer = (playerName) => {
    return () => this.state.managingSocket.emit('bootPlayer', playerName, 'political-capital-boot-password')
  }

  renderKickButton(player){
    return(
      <Flexbox flexBasis='10%' justifyContent='flex-end' alignItems='center'>
        <IconButton style={ { zIndex: '3' } } iconStyle={ { width: '15px', height: '15px' } } tooltip={ 'Kick ' + player.name } onClick={ this.bootPlayer(player.name) }>
          { svgIcon('cancel', '#566573') }
        </IconButton>
      </Flexbox>
    )
  }

  renderPlayerSelecting = (player) => {
    return this.props.renderPlayerSelecting ? this.props.renderPlayerSelecting(player) : <font> { player.isReady ? this.allColors[player.party - 1] : 'Selecting...' } </font>
  }

  renderPlayerViewTable(player){
    return(
      <Flexbox className='player-table-font-scaled' id={ player.name } justifyContent='space-between' alignItems='center' style={ { position: 'relative', width: '100%' } }>
        <div style={ { padding: '10px', position: 'absolute', width: '100%', height: '100%', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: '2', opacity: '0.25', background: player.isReady ? this.allColorHexes[player.party - 1] : '' } } />
        <Flexbox flexBasis='60%' justifyContent='center'> <font> { player.name } </font> </Flexbox>
        <Flexbox flexBasis='30%' justifyContent='center'>
          { this.renderPlayerSelecting(player) }
        </Flexbox>
        { this.renderKickButton(player) }
      </Flexbox>
    )
  }

  renderPlayers = () => {
    return (
      <Flexbox id='Players' flexBasis='70%' flexDirection='row' flexWrap='wrap'>
        { Object.values(this.state.fullGame.players).map((player) => (
          <Flexbox className={ 'player-table' + (player.isReady ? ' is-ready' : '') } key={ player.name } style={ { position: 'relative', width: '32vw' } } flexBasis='content'>
            { this.renderPlayerViewTable(player) }
          </Flexbox>
        ))}
      </Flexbox>
    )
  }

  renderNoPlayers = () => {
    return(
      <Flexbox id='No Players' flexBasis='70%' justifyContent='center' alignItems='center' flexGrow={ 1 } flexDirection='column' style={ { height: '30vh' } }>
        <font style={ { fontSize: '5vmin' } }> Waiting For Players </font>
      </Flexbox>
    )
  }

  /** Main Rendering */

  renderFullGameSettingsAndPlayers = () => {
    return(
      <Flexbox flexGrow={ 1 } alignItems='flex-start' style={ { marginTop: '2vh' } }>
        <Flexbox id='Game Settings' flexBasis='30%' flexDirection='column' flexGrow={ 1 }>
          { this.renderDetailedSettingsView() }
        </Flexbox>
        { Object.keys(this.state.fullGame.players).length > 0 ? this.renderPlayers() : this.renderNoPlayers() }
      </Flexbox>
    )
  }

  startGame = () => {
    this.state.managingSocket.emit('startGame')
    this.state.dispatch(inGame(true, true))
  }

  renderStartGame = () => {
    return(
      <Flexbox flexGrow={ 1 } justifyContent='center' alignItems='center' style={ { height: '13vh', margin: '15px' } }>
        <RaisedButton labelStyle={ { color: 'white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '8vmin' } } style={ { width: '50vw', height: '10vh' } } primary={ true } label='Start' disabled={ !this.state.startGame } onClick={ this.startGame } />
      </Flexbox>
    )
  }

  renderGameCreationState = () => {
    return(
      <Flexbox style={ { position: 'relative', width: '100%' } } flexDirection='column'>
        { this.renderCancelAndRoomIdentifier() }
        { this.renderMainTitle() }
        { this.state.fullGame && this.renderFullGameSettingsAndPlayers() }
        { this.renderStartGame() }
        <img alt='Logo' src={ ResyncLogo } style={ { position: 'fixed', bottom: '25px', right: '25px' } } width='50vmin' height='50vmin' />
      </Flexbox>
    )
  }

  render() {
    return (
      <Flexbox id='Room Setup' flexDirection='column' flexGrow={ 1 } className='no-moving'>
        { this.renderGameCreationState() }
      </Flexbox>
    )
  }
}

export default GameCreation
