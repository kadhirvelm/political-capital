import React, { Component } from 'react'
import Flexbox from 'flexbox-react'

import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import CircularProgress from 'material-ui/CircularProgress'
import IconButton from 'material-ui/IconButton'
import TextField from 'material-ui/TextField'
import Dialog from 'material-ui/Dialog'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import {
  Step,
  Stepper,
  StepLabel,
} from 'material-ui/Stepper'

import { getCurrentRooms, createNewRoom, getSpecificRoom, setPlayerName } from '../../State/ServerActions'

import { colors } from '../../styles/colors'
import { svgIcon } from '../../Images/icons'
import { curry } from 'ramda'

import { _ } from 'underscore'
import { match, assoc } from 'ramda'

class RoomConnection extends Component {
  constructor(props){
    super(props)
    this.state = Object.assign({}, this.propsConst(props), {
      newRoomDialog: false,
      enterPassword: false,
      newRoomEntry: {},
      managingSocket: {},
      error: '',
      attemptingToConnect: false,
      stepIndex: 0,
    })
  }

  propsConst = (props) => {
    return({
      dispatch: props.dispatch,
      joinRoom: props.joinRoom,
      isFetching: props.isFetching,
      errorMessage: props.errorMessage,
      socketManager: props.socketManager,
    })
  }

  setCurrentRooms = (rooms, callback) => {
    this.setState({ currentRooms: rooms }, callback)
  }

  refreshRooms = () => {
    this.state.dispatch(getCurrentRooms(this.setCurrentRooms))
  }

  componentWillMount(){
    this.refreshRooms()
  }

  componentWillReceiveProps(props){
    this.setState(this.propsConst(props))
  }

  connectToRoom = (room, event) => {
    if(_.isEmpty(room.password) || room.password === this.state.enteredPassword){
      this.setState({ enterPassword: false }, () => {
        const handleCallback = (roomExists) => {
          if(roomExists.exists && _.isEmpty(this.state.managingSocket)){
            if(!roomExists.inGame){
              const socket = this.state.socketManager.socket('/' + room.roomName, { autoConnect: true, reconnection: true })
              socket.on('connect', () => {
                this.state.joinRoom(room)
              })
              this.setState({ managingSocket: socket })
            } else {
              this.setState({ connectingErrors: 'Room ' + room.roomName + ' is already in game' }, () => {
                this.refreshRooms()
              })
            }
          } else {
            this.setState({ connectingErrors: 'Room ' + room.roomName + ' no longer exists' }, () => {
              this.refreshRooms()
            })
          }
        }
        this.setState({ attemptingToConnect: room._id }, () => {
          this.state.dispatch(getSpecificRoom(room._id, handleCallback))
        })
      })
    } else {
      this.setState({ attemptingToConnectToRoom: room, enterPassword: true, error: this.state.enteredPassword && 'Incorrect Password', enteredPassword: '' })
    }
  }

  curryConnectToRoom = curry(this.connectToRoom)

  openNewRoomDialog = () => this.setState({ newRoomDialog: true })
  onRequestClose = () => this.setState({ newRoomDialog: false, enterPassword: false, error: '' })

  handleRoomDetails = (key, event) => {
    if(match(/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g, event.target.value).length === 0){
      const currRoomDetails = this.state.newRoomEntry
      currRoomDetails[key] = event.target.value
      this.setState({ newRoomEntry: currRoomDetails, errorMessage: {} })
    } else {
      this.setState({ errorMessage: { error: 'No Emojis Allowed' } })
    }
  }
  curryHandleRoomDetails = curry(this.handleRoomDetails)

  handleSelectFieldRoomDetails = (key, event, index, value) => {
    if(value){
      this.setState({ newRoomEntry: assoc(key, value, this.state.newRoomEntry) })
    }
  }
  curryHandleSelectFieldRoomDetails = curry(this.handleSelectFieldRoomDetails)

  submitNewRoom = () => {
    if(this.state.newRoomEntry.admin && this.state.newRoomEntry.roomName){
      this.state.dispatch(setPlayerName(this.state.newRoomEntry.admin))
      this.setState({ enteredPassword: this.state.newRoomEntry.password }, () => {
        this.state.dispatch(createNewRoom(this.state.newRoomEntry.roomName, this.state.newRoomEntry.password, this.state.newRoomEntry.admin || '', this.state.newRoomEntry.gameType, this.handleNewRoomCallback))
      })
    } else {
      this.setState({ errorMessage: { error: 'Missing Fields' } })
    }
  }

  handleNewRoomCallback = (newRoom) => {
    this.setState({ newRoomDialog: false, newRoom: newRoom }, () => {
      this.state.dispatch(getCurrentRooms(this.autoJoinRoom))
    })
  }

  autoJoinRoom = (data) => {
    this.setCurrentRooms(data, () => {
      this.connectToRoom(this.state.newRoom)
    })
  }

  changeEnteredPassword = (event) => {
    this.setState({ enteredPassword: event.target.value })
  }

  decreaseStep = () => this.setState({ stepIndex: this.state.stepIndex - 1 })
  increaseStep = () => this.setState({ stepIndex: this.state.stepIndex + 1 })

  renderForwardBackAndDoneButtons = () => {
    return(
      <Flexbox flexGrow={ 1 } justifyContent='flex-end'>
        <FlatButton label={ this.state.stepIndex ? 'Back' : 'Cancel' } onTouchTap={ this.state.stepIndex ? this.decreaseStep : this.onRequestClose } />
        <RaisedButton label={ this.state.stepIndex ? 'Done' : 'Next' } onTouchTap={ this.state.stepIndex ? this.submitNewRoom : this.increaseStep } />
      </Flexbox>
    )
  }

  renderCurrentCreateRoomStep = () => {
    switch(this.state.stepIndex){
      case 0:
        return(
          <Flexbox flexDirection='column'>
            <TextField floatingLabelText='Room Name' errorText=' ' id='roomName' onChange={ this.curryHandleRoomDetails('roomName') } value={ this.state.newRoomEntry.roomName || '' } style={ { width: '85%' } } />
            <TextField floatingLabelText='Player Name' errorText=' ' id='Admin' onChange={ this.curryHandleRoomDetails('admin') } value={ this.state.newRoomEntry.admin || '' } style={ { width: '85%' } } />
            { this.renderForwardBackAndDoneButtons() }
          </Flexbox>
        )
      case 1:
        return(
          <Flexbox flexDirection='column'>
            <SelectField floatingLabelText='Deck' id='deck' onChange={ this.curryHandleSelectFieldRoomDetails('gameType') } value={ this.state.newRoomEntry.gameType || 'Vanilla' } style={ { width: '85%' } }>
              <MenuItem value='Commonwealth' primaryText='Commonwealth' />
              <MenuItem value='Vanilla' primaryText='Tutorial' />
            </SelectField>
            <TextField floatingLabelText='Password (Optional)' id='password' onChange={ this.curryHandleRoomDetails('password') } value={ this.state.newRoomEntry.password || '' } style={ { width: '85%' } } />
            { this.renderForwardBackAndDoneButtons() }
          </Flexbox>
        )
      default:
        return
    }
  }

  renderPoliticalCapitalRooms = () => {
    return this.state.currentRooms ?
      (<Flexbox flexDirection='row' flexWrap='wrap' justifyContent='space-around'>
        { this.state.currentRooms.map((room, index) => (
          <Flexbox key={ index } flexDirection='column' style={ { margin: '5px', width: '45%', height: '250px', background: '#FFFFFF', borderColor: colors.LIGHT_GRAY, borderWidth: '1px', borderStyle: 'solid' } }>
            <Flexbox flexDirection='column' justifyContent='space-around' style={ { margin: '10px' } }>
              <Flexbox flexDirection='column' justifyContent='center' alignItems='center' style={ { wordWrap: 'break-word' } }>
                <font size={ 5 } color={ colors.DARK_BLUE } style={ { width: '95%', wordWrap: 'break-word' } }> { room.roomName.replaceAll('%20', ' ') } </font>
                <font size={ 3 } color={ colors.DARK_GRAY }> { room.gameType } </font>
              </Flexbox>
              <Flexbox flexDirection='column' flexGrow={ 1 } alignItems='flex-start' style={ { marginTop: '10px' } }>
                <font size={ 2 } color={ colors.DARK_GRAY }> <u> Players </u> </font>
                { _.keys(room.players).map((player, number) => (
                  <font key={ number } size={ 2 } color={ colors.DARK_GRAY }> { player } </font>
                ))
                }
              </Flexbox>
            </Flexbox>
            <Flexbox flexGrow={ 1 } flexDirection='column' justifyContent='flex-end' alignItems='center'>
              { this.state.attemptingToConnect === room._id ?
                <CircularProgress color={ colors.DARK_BLUE } />
                :
                <RaisedButton style={ { width: '90%', marginBottom: '10px' } } secondary={ true } label={ room.inGame ? 'In Game' : 'Join Room' + (_.isEmpty(room.password) ? '' : '**') } onTouchTap={ this.curryConnectToRoom(room) } disabled={ room.inGame } />
              }
            </Flexbox>
          </Flexbox>
        ))
        }
      </Flexbox>)
      :
      <Flexbox flexGrow={ 1 } justifyContent='center' alignItems='center'>
        No Available rooms
      </Flexbox>
  }

  renderHeaderAndRooms = () => {
    return(
      <Flexbox flexGrow={ 1 } flexDirection='column'>
        <Flexbox flexGrow={ 1 } justifyContent='center'>
          <font style={ { margin: '15px' } } size='6'> Political Capital </font>
        </Flexbox>
        <Flexbox flexGrow={ 1 } style={ { margin: '10px' } }>
          <RaisedButton fullWidth={ true } primary={ true } label='Create Game' onTouchTap={ this.openNewRoomDialog } />
        </Flexbox>
        <Flexbox flexGrow={ 1 } justifyContent='center'>
          <font size={ 3 } style={ { margin: '10px', marginBottom: '10px' } }> <u> Available Games </u> </font>
          <IconButton id='Refresh' onTouchTap={ this.refreshRooms } style={ { width: 36, height: 36 } } iconStyle={ { width: 18, height: 18 } }>
            { svgIcon('refresh', colors.MEDIUM_BLUE) }
          </IconButton>
        </Flexbox>
        <Flexbox justifyContent='center'>
          <font color={ colors.RED }> { this.state.connectingErrors && this.state.connectingErrors } </font>
        </Flexbox>
        { this.renderPoliticalCapitalRooms() }
      </Flexbox>
    )
  }

  createNewRoomDialog = () => {
    return(
      <Dialog title='Create New Game' modal={ true } open={ this.state.newRoomDialog } onRequestClose={ this.onRequestClose } autoDetectWindowHeight={ false } repositionOnUpdate={ false }>
        <Flexbox flexDirection='column' alignItems='center'>
          <Stepper activeStep={ this.state.stepIndex }>
            <Step>
              <StepLabel>Required</StepLabel>
            </Step>
            <Step>
              <StepLabel>Optional</StepLabel>
            </Step>
          </Stepper>
          { this.renderCurrentCreateRoomStep() }
          <font color='red'> { this.state.errorMessage ? this.state.errorMessage.error : '' } </font>
        </Flexbox>
      </Dialog>
    )
  }

  enterRoomPasswordDialog = () => {
    const passwordActions = [
      <RaisedButton
        key='Cancel'
        label='Cancel'
        secondary={ true }
        onTouchTap={this.onRequestClose }
        style={ { marginRight: '10px' } }
      />,
    ]
    return(
      <Dialog title='Enter Password' actions={ passwordActions } modal={ false } open={ this.state.enterPassword } onRequestClose={ this.onRequestClose } autoDetectWindowHeight={ false } repositionOnUpdate={ false }>
        <Flexbox flexDirection='column' alignItems='center'>
          <TextField floatingLabelText='Password' id='password' onChange={ this.changeEnteredPassword } value={ this.state.enteredPassword || '' } style={ { width: '85%' } } />
          <RaisedButton key='Join' label='Join' primary={ true } onTouchTap={this.curryConnectToRoom(this.state.attemptingToConnectToRoom) } />
          <font color='red'> { this.state.error || '' } </font>
        </Flexbox>
      </Dialog>
    )
  }

  render() {
    return (
      <Flexbox id='Room Connection' flexDirection='column'>
        { this.renderHeaderAndRooms() }
        { this.createNewRoomDialog() }
        { this.enterRoomPasswordDialog() }
      </Flexbox>
    )
  }
}

export default RoomConnection
