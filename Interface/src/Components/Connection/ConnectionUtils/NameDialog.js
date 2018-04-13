import React, { Component } from 'react'
import Flexbox from 'flexbox-react'

import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'
import Dialog from 'material-ui/Dialog'
import {
  Step,
  Stepper,
  StepLabel,
} from 'material-ui/Stepper'
import IconButton from 'material-ui/IconButton'

import { svgIcon } from '../../../Images/icons'

import { match } from 'ramda'
import { _ } from 'underscore'
import { NameGeneratorContext } from './Catalog.js'

class NameDialog extends Component {
  constructor(props){
    super(props)
    this.nameGeneratorContext = new NameGeneratorContext()
    this.state = Object.assign({}, this.propsConst(props), {
      activeStep: 0,
      dispatch: props.dispatch,
      name: '',
      title: this.nameGeneratorContext.generateNewTitle(),
    })
  }

  propsConst(props){
    return {
      playerNames: props.playerNames,
      finalizeJoiningLobby: props.finalizeJoiningLobby,
      disconnect: props.disconnect,
    }
  }

  componentWillReceiveProps(nextProps){
    this.setState(this.propsConst(nextProps))
  }

  handleSetPlayerName = (event) => {
    if(match(/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g, event.target.value).length === 0){
      this.setState({ playerName: event.target.value.trimLeft(), error: '' })
    } else {
      this.setState({ error: 'Name cannot contain emojis.' })
    }
  }

  checkForNameUniqueness = () => {
    const playerName = [ this.state.title, this.state.name ].join(' ')
    if (!_.contains(this.state.playerNames, playerName)) {
      this.state.finalizeJoiningLobby(playerName)
    } else {
      this.setState({ titleError: 'Name already taken.' })
    }
  }

  ableToJoinLobby = () => {
    if(this.state.playerNames){
      this.checkForNameUniqueness()
    } else {
      this.setState({ titleError: 'Hang tight, fetching current player names.' })
    }
  }

  joinLobby = (playerSubmitted = true) => {
    if (this.state.name) {
      this.ableToJoinLobby(playerSubmitted)
    } else {
      this.setState({ errorText: 'Please enter your name.', activeStep: 0 })
    }
  }

  handleSetTextfield = (key) => {
    return (event, value) => this.setState({ [key]: value })
  }

  renderNameStep = () => {
    return(
      <Flexbox>
        <TextField id='Name Field' errorText={ this.state.errorText } floatingLabelText='Your Name' fullWidth={ true } onChange={ this.handleSetTextfield('name') } value={ this.state.name } />
      </Flexbox>
    )
  }

  generateNewName = () => {
    this.setState({ title: this.nameGeneratorContext.generateNewTitle() })
  }

  renderTitleStep = () => {
    return(
      <Flexbox alignItems='center' flexDirection='column'>
        <Flexbox alignItems='center' style={ { position: 'relative' } }>
          <IconButton onClick={ this.generateNewName } style={ { width: '30px', height: '30px', top: '50%', transform: 'translateY(50%)', marginRight: '15px' } } iconStyle={ { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' } }>
            { svgIcon('dice') }
          </IconButton>
          <TextField errorText={ this.state.titleError } id='Title Field' floatingLabelText='Title' fullWidth={ true } onChange={ this.handleSetTextfield('title') } value={ this.state.title } />
        </Flexbox>
        <font style={ { color: 'gray', marginTop: '25px', marginBottom: '-10px', border: 'gray 0.1px solid', padding: '15px' } }> "{ this.state.title }" { this.state.name } </font>
      </Flexbox>
    )
  }

  renderCurrentStep = () => {
    switch(this.state.activeStep){
      case 0:
        return this.renderNameStep()
      case 1:
        return this.renderTitleStep()
      default:
        return
    }
  }

  increaseStep = () => {
    let currStep = this.state.activeStep
    this.setState({ activeStep: ++currStep })
  }
  decreaseStep = () => {
    let currStep = this.state.activeStep
    this.setState({ activeStep: --currStep })
  }

  renderSubmitNameDialog = () => {
    const actions = [
      this.state.activeStep ? <RaisedButton key='Back' label='Back' onTouchTap={ this.decreaseStep } style={ { marginRight: '15px' } } /> : <RaisedButton key='Cancel' label='Cancel' onTouchTap={ this.state.disconnect } style={ { marginRight: '15px' } } />,
      this.state.activeStep ? <RaisedButton label='Join!' primary={ true } onClick={ this.joinLobby } /> : <RaisedButton label='Next' secondary={ true } onClick={ this.increaseStep } />,
    ]
    return(
      <Dialog title='Enter Your Name' id='Name' actions={ actions } modal={ true } open={ true } autoDetectWindowHeight={ false } repositionOnUpdate={ false }>
        <Stepper activeStep={ this.state.activeStep }>
          <Step>
            <StepLabel>Name</StepLabel>
          </Step>
          <Step>
            <StepLabel>Title</StepLabel>
          </Step>
        </Stepper>
        { this.renderCurrentStep() }
      </Dialog>
    )
  }

  render() {
    return (
      <Flexbox id='Name Dialog' flexDirection='column' flexGrow={ 1 }>
        { this.renderSubmitNameDialog() }
      </Flexbox>
    )
  }
}

export default NameDialog
