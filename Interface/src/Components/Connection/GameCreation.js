import React, { Component } from 'react'
import Flexbox from 'flexbox-react'
import { resetEverything } from '../../State/ServerActions'
import RaisedButton from 'material-ui/RaisedButton'
import IconButton from 'material-ui/IconButton'
import GameCreationDialog from './GameCreationDialog'
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
    this.state = Object.assign({}, this.propsConst(this.props), {
      hasHovered: false,
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

  handleAllSocketConnections = () => {
    if(this.props.connectedRoom && !this.state.managingSocket){
      this.setState({ managingSocket: io(process.env.REACT_APP_POLITICAL_CAPITAL + '/' + this.props.connectedRoom._id) }, () => {
        this.state.managingSocket.emit('getFullGame')

        this.state.managingSocket.on('receiveFullGame', (fullGame) => {
          this.setState({ fullGame: fullGame })
        })
      })
    }
  }

  removeHoverMeIndicator = () => {
    if(!this.state.hasHovered){
      this.setState({ hasHovered: true })
    }
  }

  renderCancelAndRoomIdentifier = () => {
    return(
      <Flexbox style={ { position: 'absolute' } } flexDirection='column'>
        <RaisedButton label={ (<h2> Cancel </h2>) } onClick={ this.resetToHome } style={ { width: '5vw', height: '5vh' } } labelStyle={ { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' } } />
        <Flexbox className={ 'room-identifier ' + (this.state.hasHovered ? '' : 'hover-me-indicator') } onMouseOver={ this.removeHoverMeIndicator } alignItems='center'> <font> Room ID: <font className='increase-size'> { this.state.connectedRoom && this.state.connectedRoom._id } </font> </font> </Flexbox>
      </Flexbox>
    )
  }

  renderMainTitle(){
    return(
      <Flexbox flexDirection='column' flexGrow={ 1 } alignItems='center'>
        <Flexbox flexGrow={ 1 } alignItems='center' flexDirection='column' style={ { marginBottom: '15px' } }>
          <font style={ { fontSize: '7vw' } }> Political Capital </font>
          <font style={ { fontSize: '5vw' } }> By Resync </font>
        </Flexbox>
      </Flexbox>
    )
  }

  bootPlayer = (playerName) => {
    return () => this.state.managingSocket.emit('bootPlayer', playerName)
  }

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

  settings = () =>
    [
      { name: 'Start Senators', key: 'START_SENATORS', max: 10, min: 1 },
      { name: 'Initial Capital', key: 'START_CAPITAL', max: 120, min: 0 },
      { name: 'Total Rounds', key: 'ROUNDS', max: 10, min: 1 },
      { name: 'Senate Tax', key: 'SENATE_TAX', max: 40, min: 0 },
    ]

  renderDetailedSettingsView = () => {
    return (
      <Flexbox id='Settings' style={ { backgroundColor: '#F9E79F', padding: '5px', borderColor: '#F7DC6F', borderStyle: 'solid', borderWidth: '1px', borderRadius: '10px', height: '60vh' } } flexDirection='column'>
        <Flexbox justifyContent='center'> <h2> { this.state.fullGame.gameType } Deck Settings </h2> </Flexbox>
        <Flexbox id='Settings Holder' flexGrow={ 1 } flexWrap='wrap' justifyContent='space-around' alignItems='center'>
          { this.settings().map((settings, index) => (
            <div id={ index } key={ index }> { this.adjustItem(settings.name, settings.key, settings.max, settings.min) } </div>
          ))
          }
        </Flexbox>
      </Flexbox>)
  }

  renderFullGameSettingsAndPlayers = () => {
    return(
      <Flexbox flexGrow={ 1 } alignItems='flex-start'>
        <Flexbox id='Game Settings' flexBasis='40%' flexDirection='column' flexGrow={ 1 }>
          { this.renderDetailedSettingsView() }
        </Flexbox>
        <Flexbox id='Players' flexBasis='60%' flexDirection='column'>
          { Object.values(this.state.fullGame.players).map((value) => (
            <Flexbox className='player-table' key={ value.name } style={ { position: 'relative' } }>
              { value.name }
              <IconButton tooltip={ 'Kick ' + value.name } onClick={ this.bootPlayer(value.name) } style={ { position: 'absolute', right: '1%', top: '50%', transform: 'translate(-1%, -50%)' } }>
                { svgIcon('cancel', 'red') }
              </IconButton>
            </Flexbox>
          ))}
        </Flexbox>
      </Flexbox>
    )
  }

  renderGameCreationState = () => {
    return(
      <Flexbox style={ { position: 'relative', width: '100%' } } flexDirection='column'>
        { this.renderCancelAndRoomIdentifier() }
        { this.renderMainTitle() }
        { this.state.fullGame && this.renderFullGameSettingsAndPlayers() }
        <img alt='Logo' src={ ResyncLogo } style={ { position: 'fixed', bottom: '25px', right: '25px' } } width='50vmin' height='50vmin' />
      </Flexbox>
    )
  }

  render() {
    return (
      <Flexbox id='Room Setup' flexDirection='column' flexGrow={ 1 }>
        { this.state.isCreatingRoom ? <GameCreationDialog resetToHome={ this.resetToHome } {...this.props } /> : this.renderGameCreationState() }
      </Flexbox>
    )
  }
}

export default GameCreation
