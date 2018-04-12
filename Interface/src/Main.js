import React, { Component } from 'react'

import Async from 'react-code-splitting'
import Flexbox from 'flexbox-react'
import { Route, Switch } from 'react-router-dom'

import { mapStateToProps } from './State/StateMethods'
import { connect } from 'react-redux'

import { disconnect } from './State/ServerActions'

export class Main extends Component {
  constructor(props){
    super(props)
    this.state = Object.assign({}, this.propsConst(props))
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
      isJoiningRoom: props.serverActions.isJoiningRoom,
      isCreatingRoom: props.serverActions.isCreatingRoom,
    })
  }

  componentDidMount(){
    this.renderCurrentState()
  }

  disconnect = () => {
    this.state.dispatch(disconnect())
  }

  componentWillReceiveProps(nextProps){
    this.setState(this.propsConst(nextProps), () => {
      this.renderCurrentState()
    })
  }

  changeWindowLocation = (newLocation) => {
    if(!window.location.href.endsWith(newLocation)) {
      window.location.href = newLocation
    }
  }

  renderCurrentState = () => {
    if (this.state.inGame){
      this.changeWindowLocation('game')
    } else if (this.state.isJoiningRoom){
      this.changeWindowLocation('connect')
    } else if (this.state.isCreatingRoom) {
      this.changeWindowLocation('create')
    } else if (this.state.isHostingRoom) {
      this.changeWindowLocation('overview/' + this.state.connectedRoom._id)
    } else {
      this.changeWindowLocation('home')
    }
  }

  renderHomeScreen = (props) => <Async load={ import('./Components/Home/Home') } componentProps={ props } />

  renderHome = () => {
    return this.renderHomeScreen({
      dispatch: this.state.dispatch,
    })
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
    switch(this.state.connectedRoom && this.state.connectedRoom.gameType){
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

  renderGameCreation = (props) => <Async load={ import('./Components/Connection/GameCreation') } componentProps={ props } />

  renderCreate = () => {
    return this.renderGameCreation({
      dispatch: this.state.dispatch,
      connectedRoom: this.state.connectedRoom,
    })
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
    switch(this.state.connectedRoom && this.state.connectedRoom.gameType){
      case 'Commonwealth':
        return this.renderCommonwealthGame(props)
      default:
        return this.renderPoliticalCapitalGame(props)
    }
  }

  renderLoading = () => {
    this.renderCurrentState()
    return (<div id='Loading'> Routing... </div>)
  }

  renderGameOverview = (props) => <Async load={ import('./Components/OutsideGame/GameOverviewScreen') } componentProps={ props } />
  renderOverview = () => {
    return this.renderGameOverview({
      dispatch: this.state.dispatch,
    })
  }

  render() {
    return (
      <Flexbox flexDirection='column' flexGrow={ 1 }>
        <Switch>
          <Route path='/home' component={ this.renderHome } />
          <Route path='/connect' component={ this.renderConnection } />
          <Route path='/create' component={ this.renderCreate } />
          <Route path='/game' component={ this.renderGame } />
          <Route path='/overview/:id' component={ this.renderOverview } />
          <Route path='/*' component={ this.renderLoading } />
        </Switch>
      </Flexbox>
    )
  }
}

export default connect(mapStateToProps)(Main)
