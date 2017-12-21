import React from 'react'
import PartyCards from '../PartyCards'

import { svgIcon } from '../../../Images/icons'
import { commonwealthAllColors } from '../../../styles/colors'

class CommonwealthPartyCards extends PartyCards {
    renderSelectPartyCardFor = () => <font> Select party card for { this.cut(this.state.playerPartyName) || '' } ({ svgIcon(commonwealthAllColors[this.state.playerParty - 1]) }) </font>

    commonwealthPartyCards = (value, type) => {
      switch(value){
        case 'Get Sen':
          return this.partyCardTextTemplate(type, 'Get Senator', 'Get a senator at the end of the round, whether the resolution passes or fails.')
        case '2x Both':
          return this.partyCardTextTemplate(type, '2x', 'Raise the stakes by doubling both the payoff and loss for this round.')
        case 'Give 20':
          return this.partyCardTextTemplate(type, 'Give Away 20', 'Give 20 political capital to another player who is not on your party.')
        case 'Lose 20':
          return this.partyCardTextTemplate(type, 'Lose 20', 'Lose 20 political capital at the end of the round.')
        case 'Lose Sen':
          return this.partyCardTextTemplate(type, 'Lose Senator', 'Lose a senator at the end of this round, remember you cannot drop below 2 senators.')
        default:
          return
      }
    }

    valueBonus = (value, type) => {
      return super.valueBonus(value, type) || this.commonwealthPartyCards(value, type)
    }
}

export default CommonwealthPartyCards
