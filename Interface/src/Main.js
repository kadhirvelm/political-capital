import React, { Component } from 'react'

import Async from 'react-code-splitting'
import Flexbox from 'flexbox-react'
import { Route, Switch } from 'react-router-dom'

import RoomConnection from './Components/Connection/RoomConnection'

import { mapStateToProps } from './State/StateMethods'
import { connect } from 'react-redux'

import { setRooms, disconnect } from './State/ServerActions'
import { Manager } from 'socket.io-client'

import { _ } from 'underscore'

export class Main extends Component {
  constructor(props){
    super(props)
    this.state = Object.assign({}, this.propsConst(props), {
      socketManager: new Manager(process.env.REACT_APP_POLITICAL_CAPITAL, { autoConnect: true, reconnection: true }),
    })
  }

  propsConst = (props) => {
    return({
      dispatch: props.dispatch,
      connectedRoom: props.serverActions.connectedRoom,
      playerName: props.serverActions.playerName,
      playerParty: props.serverActions.playerParty,
      playerPartyName: props.serverActions.playerPartyName,
      playerReady: props.serverActions.playerReady,
      inGame: props.serverActions.inGame,
      isFetching: props.serverActions.isFetching,
      errorMessage: props.serverActions.message,
      hasSeenTabulation: props.serverActions.hasSeenTabulation,
      gameType: props.serverActions.gameType || 'Vanilla',
    })
  }

  componentDidMount(){
    this.renderCurrentState()
  }

  joinRoom = (room, socket) => {
    this.setState({ gameType: room.gameType, connectedRoom: room }, () => {
      this.state.dispatch(setRooms(room, socket))
    })
  }

  disconnect = () => {
    this.state.dispatch(disconnect())
  }

  componentWillReceiveProps(nextProps){
    this.setState(this.propsConst(nextProps), () => {
      this.renderCurrentState()
    })
  }

  componentWillUnmount(){
    this.state.socketManager.disconnect()
  }

  // renderRoomConnect = (props) => <Async load={ import('./Components/RoomConnection') } componentProps={ props } />
  renderRoomConnect = (props) => <RoomConnection { ...props } />

  changeWindowLocation = (newLocation) => {
    if(!window.location.href.endsWith(newLocation)) {
      window.location.href = newLocation
    }
  }

  renderCurrentState = () => {
    if (this.state.inGame){
      this.changeWindowLocation('game')
    } else if (_.isObject(this.state.connectedRoom)){
      this.changeWindowLocation('connect')
    } else if (this.state.isJoiningRoom){
      this.changeWindowLocation('rooms')
    } else {
      this.changeWindowLocation('home')
    }
  }

  renderPoliticalCapitalGame = (props) => <Async load={ import('./Components/Game/Game') } componentProps={ props } />
  renderCommonwealthGame = (props) => <Async load={ import('./Components/Game/Commonwealth/Game') } componentProps={ props } />

  renderGame = () => {
    const props = {
      dispatch: this.state.dispatch,
      connectedRoom: this.state.connectedRoom,
      playerName: this.state.playerName,
      players: this.state.players,
      playerParty: this.state.playerParty,
      playerPartyName: this.state.playerPartyName,
      disconnect: this.disconnect,
      hasSeenTabulation: this.state.hasSeenTabulation,
    }
    switch(this.state.gameType){
      case 'Commonwealth':
        return this.renderCommonwealthGame(props)
      default:
        return this.renderPoliticalCapitalGame(props)
    }
  }

  renderPoliticalCapitalConnect = (props) => <Async load={ import('./Components/Connection/Connect') } componentProps={ props } />
  renderCommonwealthConnect = (props) => <Async load={ import('./Components/Connection/Commonwealth/Connect') } componentProps={ props } />

  renderConnection = () => {
    const props = {
      dispatch: this.state.dispatch,
      disconnect: this.disconnect,
      connectedRoom: this.state.connectedRoom,
      playerName: this.state.playerName,
      playerParty: this.state.playerParty,
      inGame: this.state.inGame,
      playerReady: this.state.playerReady,
      hasSeenTabulation: this.state.hasSeenTabulation,
    }
    switch(this.state.gameType){
      case 'Commonwealth':
        return this.renderCommonwealthConnect(props)
      default:
        return this.renderPoliticalCapitalConnect(props)
    }
  }

  renderRooms = () => {
    return this.renderRoomConnect({
      socketManager: this.state.socketManager,
      dispatch: this.state.dispatch,
      joinRoom: this.joinRoom,
      isFetching: this.state.isFetching,
      errorMessage: this.state.errorMessage,
    })
  }

  renderHomeScreen = (props) => <Async load={ import('./Components/Home') } componentProps={ props } />

  renderHome = () => {
    return this.renderHomeScreen()
  }

  renderLoading = () => {
    this.renderCurrentState()
    return (<div id='Loading'> Routing... </div>)
  }

  render() {
    return (
      <Flexbox flexDirection='column' flexGrow={ 1 }>
        <Switch>
          <Route path='/home' component={ this.renderHome } />
          <Route path='/rooms' component={ this.renderRooms } />
          <Route path='/connect' component={ this.renderConnection } />
          <Route path='/game' component={ this.renderGame } />
          <Route path='/*' component={ this.renderLoading } />
        </Switch>
      </Flexbox>
    )
  }
}

export default connect(mapStateToProps)(Main)
