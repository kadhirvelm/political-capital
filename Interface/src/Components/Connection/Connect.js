import React, { Component } from 'react'
import Flexbox from 'flexbox-react'

import ConnectedRoom from './ConnectedRoom'
import { resetEverything } from '../../State/ServerActions'

import Dialog from 'material-ui/Dialog'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'
import TextField from 'material-ui/TextField'

class Connect extends Component {
  constructor(props){
    super(props)
    this.state = Object.assign({}, {
      dispatch: props.dispatch,
      connectedRoom: props.connectedRoom,
      disconnect: props.disconnect,
      dialogOpen: true,
      roomCode: '',
    })
  }

  resetToHome = () => {
    this.state.dispatch(resetEverything())
  }

  attemptToConnect = () => {
    if(this.state.roomCode){
      console.log('Check for room here', this.state.roomCode)
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
          <TextField floatingLabelText='Room Code' value={ this.state.roomCode } onChange={ this.handleTextField } />
        </Flexbox>
      </Dialog>
    )
  }

  render() {
    return (
      <Flexbox id='Room Setup' flexDirection='column' flexGrow={ 1 }>
        { this.state.dialogOpen && this.renderConnectRoomDialog() }
        <ConnectedRoom { ...this.props } />
      </Flexbox>
    )
  }
}

export default Connect
