import React, { Component } from 'react'
import Flexbox from 'flexbox-react'

import ConnectedRoom from './ConnectedRoom'
import CommonwealthConnectedRoom from './Commonwealth/CommonwealthConnectedRoom'

import { resetEverything, attemptToJoinRoom } from '../../State/ServerActions'

import Dialog from 'material-ui/Dialog'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'
import TextField from 'material-ui/TextField'

import { _ } from 'underscore'

class Connect extends Component {
  constructor(props){
    super(props)
    this.state = Object.assign({}, this.propsConst(props), {
      dispatch: props.dispatch,
      disconnect: props.disconnect,
      roomCode: '',
      error: '',
    })
  }

  propsConst(props){
    return {
      connectedRoom: props.connectedRoom,
      dialogOpen: _.isUndefined(props.connectedRoom),
    }
  }

  componentWillReceiveProps(nextProps){
    this.setState(this.propsConst(nextProps))
  }

  resetToHome = () => {
    this.state.dispatch(resetEverything())
  }

  failureCallback = () => {
    this.setState({ error: 'Room ' + this.state.roomCode + ' does not exist.' })
  }

  attemptToConnect = () => {
    if(this.state.roomCode){
      this.setState({ error: '' }, () => {
        this.state.dispatch(attemptToJoinRoom(this.state.roomCode, this.failureCallback))
      })
    }
  }

  handleTextField = (event, value) => this.setState({ roomCode: value })

  renderConnectRoomDialog = () => {
    const actions = [
      <FlatButton key='Cancel' label='Cancel' onClick={ this.resetToHome } />,
      <RaisedButton key='Submit' label='Submit' onClick={ this.attemptToConnect } />,
    ]
    return(
      <Dialog title='Connect to Room' open={ this.state.dialogOpen } modal={ true } actions={ actions }>
        <Flexbox flexGrow={ 1 } justifyContent='center'>
          <TextField errorText={ this.state.error } floatingLabelText='Room ID' value={ this.state.roomCode } onChange={ this.handleTextField } />
        </Flexbox>
      </Dialog>
    )
  }

  renderConnectedRoom = () => {
    switch(this.state.connectedRoom.gameType){
      case 'Commonwealth':
        return <CommonwealthConnectedRoom { ...this.props } />
      default:
        return <ConnectedRoom { ...this.props } />
    }
  }

  render() {
    return (
      <Flexbox id='Room Setup' flexDirection='column' flexGrow={ 1 }>
        { this.state.dialogOpen && this.renderConnectRoomDialog() }
        { this.state.connectedRoom && this.renderConnectedRoom() }
      </Flexbox>
    )
  }
}

export default Connect
