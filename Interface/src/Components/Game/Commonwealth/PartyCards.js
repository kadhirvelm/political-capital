import React from 'react'
import PartyCards from '../PartyCards'

import { colors } from '../../../styles/colors'

import { svgIcon } from '../../../Images/icons'
import { commonwealthAllColors } from '../../../styles/colors'

class CommonwealthPartyCards extends PartyCards {
  constructor(props){
    super(props)
    this.POSITIVE = 'POSITIVE'
    this.NEGATIVE = 'NEGATIVE'
    this.NEUTRAL = 'NEUTRAL'
  }

  renderSelectPartyCardFor = () => <font> Select party card for { this.cut(this.state.playerPartyName) || '' } ({ svgIcon(commonwealthAllColors[this.state.playerParty - 1]) }) </font>

  typeBonus = (type) => {
    let color
    switch(type){
      case this.POSITIVE:
        color = colors.GREEN
        break
      case this.NEGATIVE:
        color = colors.RED
        break
      case this.NEUTRAL:
        color = colors.ORANGE
        break
      default:
        break
    }
    return <font size={ 4 } color={ color }> Pass/Fail Bonus </font>
  }

  valueBonus = (value) => {
    switch(value){
      case 'Get 20':
        return this.partyCardTextTemplate(this.POSITIVE, 'Get 20', 'Get 20 political capital from the treasury.')
      case 'Take 20':
        return this.partyCardTextTemplate(this.POSITIVE, 'Take 20', 'Take 20 political capital from another player.')
      case 'Get Sen':
        return this.partyCardTextTemplate(this.POSITIVE, 'Get Senator', 'Get a senator at the end of the round.')
      case '2x Both':
        return this.partyCardTextTemplate(this.NEUTRAL, '2x', 'Raise the stakes by doubling both the payoff and loss for this round.')
      case 'Give 20':
        return this.partyCardTextTemplate(this.NEGATIVE, 'Give Away 20', 'Give 20 political capital to another player who is not on your party.')
      case 'Lose 20':
        return this.partyCardTextTemplate(this.NEGATIVE, 'Lose 20', 'Lose 20 political capital at the end of the round.')
      case 'Lose Sen':
        return this.partyCardTextTemplate(this.NEGATIVE, 'Lose Senator', 'Lose a senator at the end of this round, remember you cannot drop below 2 senators.')
      case 'Nullify':
        return this.partyCardTextTemplate(this.NEUTRAL, 'Nullify', 'Nullify another party\'s party card after it has been revealed , whether the resolution passes or fails.')
      default:
        return
    }
  }
}

export default CommonwealthPartyCards
