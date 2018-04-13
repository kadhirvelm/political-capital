import React, { Component } from 'react'
import Flexbox from 'flexbox-react'

import RaisedButton from 'material-ui/RaisedButton'
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton'
import Dialog from 'material-ui/Dialog'

import { createNewRoom } from '../../State/ServerActions'

import '../../styles/global.css'
import { backLabelStyle } from '../../styles/global-consts'

import { _ } from 'underscore'

class GameCreationDialog extends Component {
  returnID(){
    return Math.floor(Math.random() * Math.floor(999))
  }

  constructor(props){
    super(props)
    this.state = Object.assign({}, this.propsConst(props), {
      dispatch: props.dispatch,
      connectedRoom: props.connectedRoom || {
        gameType: 'Tutorial',
        _id: this.returnID(),
      },
      errors: {
        gameTypeError: '',
        _idError: '',
      },
      resetToHome: props.resetToHome,
    })
  }

  propsConst(props){
    return {
      connectedRoom: props.connectedRoom || (this.state && this.state.connectedRoom),
      isCreatingRoom: _.isUndefined(props.connectedRoom),
    }
  }

  componentWillReceiveProps(nextProps){
    this.setState(this.propsConst(nextProps))
  }

  handleRadioButtonSelect = (id) => {
    return (event, value) => this.setState({ connectedRoom: Object.assign({}, this.state.connectedRoom, { [id]: value }) })
  }

  handleErrorCallback = () => {
    this.setState({ connectedRoom: Object.assign({}, this.state.connectedRoom, { _id: this.returnID() }) }, () => {
      this.handleRoomSubmit()
    })
  }

  handleRoomSubmit = () => {
    this.state.dispatch(createNewRoom(this.state.connectedRoom._id, this.state.connectedRoom.gameType, this.handleErrorCallback))
  }

  returnDeckTemplate(title, bullets){
    return(
      <Flexbox flexDirection='column' flexGrow={ 1 }>
        <Flexbox flexGrow={ 1 } justifyContent='center'>
          { title }
        </Flexbox>
        <Flexbox flexGrow={ 1 } justifyContent='flex-start'>
          { bullets }
        </Flexbox>
      </Flexbox>
    )
  }

  retrieveDeckDescription(deck) {
    switch(deck){
      case 'Tutorial':
        return this.returnDeckTemplate(
          <h3> The Tutorial (<font color='green'> Easy </font>) </h3>,
          <ul>
            <li> A basic game of political capital </li>
            <li> Great introductory deck </li>
            <li> Up to 8 political parties </li>
            <li> Basic chance </li>
            <li> Yes, no, and neutral Party Cards </li>
            <li> Only positive party cards </li>
          </ul>)
      case 'Commonwealth':
        return this.returnDeckTemplate(
          <h3> The Commonwealth (<font color='orange'> Medium </font>) </h3>,
          <ul>
            <li> An incentive driven game </li>
            <li> Four distinct political parties </li>
            <li> Each party has a different payout from each resolution </li>
            <li> Only neutral party cards </li>
            <li> Both positive and negative party cards </li>
          </ul>)
      default:
        return 'Unknown deck'
    }
  }

  renderNewGameDialog = () => {
    return(
      <Dialog modal={ true } open={ this.state.isCreatingRoom } title='Create New Game'>
        <Flexbox flexDirection='column'>
          <Flexbox flexGrow={ 1 }>
            <Flexbox id='Selector' flexGrow={ 1 } flexDirection='column'>
              <Flexbox flexDirection='column' className='game-creation-box blinker'>
                <font style={ { marginBottom: '20px' } }> Game Type: </font>
                <RadioButtonGroup name='Game Type' value={ this.state.connectedRoom.gameType } defaultSelected={ this.state.connectedRoom.gameType } onChange={ this.handleRadioButtonSelect('gameType') }>
                  <RadioButton value='Tutorial' label='Tutorial' />
                  <RadioButton value='Commonwealth' label='Common Wealth' />
                </RadioButtonGroup>
              </Flexbox>
              <Flexbox className='game-creation-box' flexDirection='column' alignItems='center' justifyContent='center'>
                <font style={ { fontSize: '4vmin' } }> Game ID - { this.state.connectedRoom._id } </font>
              </Flexbox>
            </Flexbox>
            <Flexbox id='Description' flexBasis='50%' className='game-creation-box'>
              { this.retrieveDeckDescription(this.state.connectedRoom.gameType) }
            </Flexbox>
          </Flexbox>
          <Flexbox flexGrow={ 1 } justifyContent='flex-end' alignItems='center'>
            <RaisedButton label='Cancel' onClick={ this.state.resetToHome } style={ { width: '10vw', height: '10vh', marginRight: '15px', marginTop: '15px' } } labelStyle={ backLabelStyle } />
            <RaisedButton label='Create' primary={ true } onClick={ this.handleRoomSubmit } style={ { width: '10vw', height: '10vh', marginTop: '15px' } } labelStyle={ backLabelStyle } labelColor='white' />
          </Flexbox>
        </Flexbox>
      </Dialog>
    )
  }

  render() {
    return (
      <Flexbox id='Room Setup Dilaog' flexDirection='column' flexGrow={ 1 }>
        { this.renderNewGameDialog() }
      </Flexbox>
    )
  }
}

export default GameCreationDialog
