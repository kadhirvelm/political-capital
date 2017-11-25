import React, { Component } from 'react'
import Flexbox from 'flexbox-react'
import { svgIcon } from '../../../Images/icons'

import IconButton from 'material-ui/IconButton'

import { colors } from '../../../styles/colors'

const playerInfo = {
  background: 'white',
  borderRadius: '15px',
  margin: '10px',
  height: '50px',
  width: 'auto',
  maxWidth: '35%',
  minWidth: '15%',
  padding: '15px',
  fontSize: '4vw',
  borderWidth: '1px',
  borderColor: '#424949',
  borderStyle: 'solid',
}

class Vote extends Component {
  constructor(props){
    super(props)
    this.state = this.propsConst(props)
  }

  propsConst = (props) => {
    return({
      players: props.players,
      playerName: props.playerName,
      selectedPartyCard: props.round && props.round.partyCards[props.playerPartyName],
    })
  }

  componentWillReceiveProps(nextProps){
    this.setState(this.propsConst(nextProps))
  }

  valueBonus = () => {
    const type = this.state.selectedPartyCard.type
    const value = this.state.selectedPartyCard.value

    const passOrFail = type === 'no' ? 'fails' : 'passes'

    switch(value){
      case '2x':
        return this.partyCardTextTemplate(passOrFail, '2x', 'Get twice the payoff, if the resolution' + passOrFail)
      case 'Senator':
        return this.partyCardTextTemplate(passOrFail, 'Senator', 'Get an extra senator, if the resolution' + passOrFail)
      case 'Steal':
        return this.partyCardTextTemplate(passOrFail, 'Steal 5', 'Steal 5 political capital from another player for each of their senators, if the resolution ' + passOrFail)
      case 'Get':
        return this.partyCardTextTemplate('fails or passes', 'Get 20', 'Get 20 political capital from the treasury, whether the resolution passes or fails.')
      case 'Take':
        return this.partyCardTextTemplate('fails or passes', 'Take 20', 'Take 20 political capital from another player, whether the resolution passes or fails.')
      case 'None':
        return this.partyCardTextTemplate('fails or passes', 'None', 'No Bonus')
      case 'Nullify':
        return this.partyCardTextTemplate('fails or passes', 'Nullify', 'Nullify another party\'s party card after it has been revealed , whether the resolution passes or fails.')
      default:
        return
    }
  }

  typeColor = (type) => {
    switch(type){
      case 'passes':
        return colors.GREEN
      case 'fails':
        return colors.RED
      case 'fails or passes':
        return colors.ORANGE
      default:
        return colors.DARK_GRAY
    }
  }

  partyCardTextTemplate = (type, main) => {
    return (<div> If it <font color={ this.typeColor(type) }> <b> { type } </b> </font> then you will get <font color={ this.typeColor(type) }> { main } </font> </div>)
  }

  renderPoliticalCapitalCount = () => {
    return(
      <Flexbox alignItems='center' justifyContent='center' style={ playerInfo }>
        <IconButton tooltip='Political Capital'>
          { svgIcon('coinDollar') }
        </IconButton>
        <font size={ 5 } color={ colors.DARK_GRAY } style={ { marginLeft: '15px' } }>
          { this.state.players[this.state.playerName].politicalCapital }
        </font>
      </Flexbox>
    )
  }

  renderSenatorCount = () => {
    return(
      <Flexbox alignItems='center' justifyContent='center' style={ playerInfo }>
        <IconButton tooltip='Senators'>
          { svgIcon('senator') }
        </IconButton>
        <font size={ 5 } color={ colors.DARK_GRAY } style={ { marginLeft: '15px' } }>
          { this.state.players[this.state.playerName].senators }
        </font>
      </Flexbox>
    )
  }

  render() {
    return (
      <Flexbox flexDirection='column' style={ { marginTop: '10px', width: '90%' } }>
        <Flexbox flexWrap='wrap' justifyContent='center' alignItems='center' style={ { marginBottom: '15px' } }>
          { this.renderPoliticalCapitalCount() }
          { this.renderSenatorCount() }
          { this.state.selectedPartyCard && <Flexbox alignItems='center' justifyContent='center' style={ playerInfo }> { this.valueBonus() } </Flexbox> }
        </Flexbox>
      </Flexbox>
    )
  }
}

export default Vote
