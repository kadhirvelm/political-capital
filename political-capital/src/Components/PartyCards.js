import React, { Component } from 'react'
import Flexbox from 'flexbox-react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import '../styles/Transitions.css'

import RaisedButton from 'material-ui/RaisedButton'

import { colors } from '../styles/colors'

import { _ } from 'underscore'

import { keys, filter, length, map, curry, flatten } from 'ramda'

const basePartyStyle = {
  background: '#FFFFFF',
  borderRadius: '10px',
  borderColor: colors.LIGHT_GRAY,
  borderStyle: 'solid',
  borderWidth: '1px',
  margin: '10px',
  padding: '10px',
  height: 250,
  minWidth: '125px',
  width: '30%',
}

const selectedPartyStyle = _.extend(_.clone(basePartyStyle), {
  borderColor: '#F2BD1E',
  background: '#FFECB5',
  borderStyle: 'solid',
  borderWidth: '3px',
  height: 250,
  minWidth: '125px',
  width: '30%',
})

class PartyCards extends Component {
  constructor(props){
    super(props)
    this.state = this.propsConst(props)
  }

  propsConst = (props) => {
    return({
      dispatch: props.dispatch,
      managingSocket: props.managingSocket,
      playerParty: props.playerParty,
      playerPartyName: props.playerPartyName,
      parties: props.parties,
      availablePartyCards: props.parties[props.playerParty] && this.preparePartyCards(props.parties[props.playerParty].partyCards),
      round: props.round,
      selectedPartyCard: props.selectedPartyCard,
      id: props.id,
    })
  }

  componentWillMount(){
    if(!_.isUndefined(this.state.playerPartyName)){
      this.state.managingSocket.emit('getPartyCards')
    }
  }

  componentWillReceiveProps(nextProps){
    this.setState(this.propsConst(nextProps))
  }

  preparePartyCards = (partyCards) => {
    if(partyCards){
      let availableKeys = keys(partyCards)
      availableKeys = filter((key) => length(partyCards[key]) > 0, availableKeys)
      const setKeys = (key, card) => {
        return({ type: key, value: card })
      }
      const currySetKeys = curry(setKeys)
      const setObjects = (key) => map(currySetKeys(key), partyCards[key])
      return flatten(map(setObjects, availableKeys))
    }
    return []
  }

  valueBonus = (value, type) => {
    const passOrFail = type === 'no' ? ' fail' : ' passes'
    switch(value){
      case '2x':
        return this.partyCardTextTemplate(type, '2x', 'Get twice the payoff, if the resolution' + passOrFail)
      case 'Senator':
        return this.partyCardTextTemplate(type, 'Senator', 'Get an extra senator, if the resolution' + passOrFail)
      case 'Steal':
        return this.partyCardTextTemplate(type, 'Steal 5', 'Steal 5 political capital from another player for each of their senators, if the resolution ' + passOrFail)
      case 'Get':
        return this.partyCardTextTemplate(type, 'Get 20', 'Get 20 political capital from the treasury, whether the resolution passes or fails.')
      case 'Take':
        return this.partyCardTextTemplate(type, 'Take 20', 'Take 20 political capital from another player, whether the resolution passes or fails.')
      case 'None':
        return this.partyCardTextTemplate(type, 'None', 'No Bonus')
      case 'Nullify':
        return this.partyCardTextTemplate(type, 'Nullify', 'Nullify another party\'s party card after it has been revealed , whether the resolution passes or fails.')
      default:
        return
    }
  }

  partyCardTextTemplate = (type, main, instructionText) => {
    return (
      <Flexbox flexGrow={ 1 } alignItems='center' justifyContent='center' flexDirection='column'>
        <Flexbox flexDirection='column' alignItems='center' justifyContent='center' style={ { marginTop: '20px' } }>
          { this.typeBonus(type) }
          <font size={ 5 }> { main } </font>
        </Flexbox>
        <Flexbox flexGrow={ 1 } alignItems='flex-end' style={ { marginTop: '10px', textAlign: 'center' } }>
          <div> { instructionText } </div>
        </Flexbox>
      </Flexbox>
    )
  }

  typeBonus = (type) => {
    switch(type){
      case 'yes':
        return (<font size={ 5 } color={ colors.GREEN }> Pass Bonus </font>)
      case 'no':
        return (<font size={ 5 } color={ colors.RED }> Fail Bonus </font>)
      case 'neutral':
        return (<font size={ 4 } color={ colors.ORANGE }> Pass/Fail Bonus </font>)
      default:
        return
    }
  }

  selectCard = (entry, event) => {
    console.log('Emitting', this.state.managingSocket, entry)
    if(_.isEqual(this.state.selectedPartyCard, entry)){
      this.state.managingSocket.emit('selectPartyCard')
    } else {
      this.state.managingSocket.emit('selectPartyCard', entry)
    }
  }

  currySelectCard = curry(this.selectCard)

  handleFinalSelection = () => {
    this.state.managingSocket.emit('finalizePartyCard', this.state.selectedPartyCard)
  }

  color = (type) => {
    switch(type){
      case 'yes':
        return colors.GREEN
      case 'no':
        return colors.RED
      case 'neutral':
        return colors.ORANGE
      default:
        return
    }
  }

  hasFinalizedCardSelection = () => {
    if(this.state.round && this.state.round.partyCards){
      return this.state.playerPartyName in this.state.round.partyCards
    }
    return false
  }

  translate = (type) => {
    switch(type){
      case 'yes':
        return 'Pass'
      case 'no':
        return 'Fail'
      case 'neutral':
        return 'Pass/Fail'
      default:
        break
    }
  }

  cut = (string) => {
    return string.length > 20 ? string.substring(0, 20) + '...' : string
  }

  renderSelectPartyCardFor = () => <font> Select party card for { this.cut(this.state.playerPartyName) || '' } </font>

  render() {
    return (
      <Flexbox id={ this.state.id } flexDirection='column' alignItems='center' style={ { marginTop: '20px' } }>
        <ReactCSSTransitionGroup
          transitionName='fade-fast'
          transitionEnterTimeout={ 500 }
          transitionLeaveTimeout={ 500 }
        >
          { this.hasFinalizedCardSelection() ?
            <Flexbox key='Collecting' flexGrow={ 1 } flexDirection='column' alignItems='center'>
              <font> Collecting Party Cards ( { _.keys(this.state.round.partyCards).length } / { _.keys(this.state.parties).length } ) </font>
              <Flexbox flexGrow={ 1 } style={ selectedPartyStyle }> { this.valueBonus(this.state.round.partyCards[this.state.playerPartyName].value, this.state.round.partyCards[this.state.playerPartyName].type) } </Flexbox>
            </Flexbox>
            :
            <Flexbox key='Selecting' flexDirection='column' alignItems='center'>
              { !_.isEmpty(this.state.selectedPartyCard) ?
                <RaisedButton backgroundColor={ this.color(this.state.selectedPartyCard.type) } style={ { width: '75%', position: 'fixed', right: '10px', bottom: '10px' } }
                  label={'Select: ' + this.translate(this.state.selectedPartyCard.type) + ' - ' + this.state.selectedPartyCard.value } onTouchTap={ this.handleFinalSelection } labelColor={ this.state.selectedPartyCard.type === 'neutral' ? '#000000' : '#FFFFFF' } />
                :
                <Flexbox justifyContent='center'>
                  { this.renderSelectPartyCardFor() }
                </Flexbox>
              }
              { this.state.availablePartyCards &&
              <Flexbox flexGrow={ 1 } flexDirection='row' justifyContent='space-around' flexWrap='wrap'>
                { this.state.availablePartyCards.map((entry, index) => (
                  <Flexbox key={ index } flexDirection='column' style={ _.isEqual(this.state.selectedPartyCard, entry) ? selectedPartyStyle : basePartyStyle } onClick={ this.currySelectCard(entry) }>
                    <Flexbox justifyContent='center'>
                      <font size={ 4 }> Party Card </font>
                    </Flexbox>
                    <Flexbox flexGrow={ 1 }> { this.valueBonus(entry.value, entry.type) } </Flexbox>
                  </Flexbox>
                ))
                }
              </Flexbox>
              }
            </Flexbox>
          }
        </ReactCSSTransitionGroup>
      </Flexbox>
    )
  }
}

export default PartyCards
