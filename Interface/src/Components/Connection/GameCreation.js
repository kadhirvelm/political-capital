import React, { Component } from 'react'
import Flexbox from 'flexbox-react'

import { resetEverything } from '../../State/ServerActions'

import Dialog from 'material-ui/Dialog'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'
import TextField from 'material-ui/TextField'

import '../../styles/global.css'
import { backLabelStyle, backButtonStyle } from '../../styles/global-consts'

class GameCreation extends Component {
  constructor(props){
    super(props)
    this.state = Object.assign({}, {
      dispatch: props.dispatch,
      connectedRoom: props.connectedRoom,
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
        <RaisedButton label={ (<h2> Back </h2>) } onClick={ this.resetToHome } primary={ true } style={ backButtonStyle } labelColor='white' labelStyle={ backLabelStyle } />
        <Flexbox style={ { position: 'absolute', top: '8%', width: '100%' } } justifyContent='center'>
          Game Creation
        </Flexbox>
      </Flexbox>
    )
  }
}

export default GameCreation
