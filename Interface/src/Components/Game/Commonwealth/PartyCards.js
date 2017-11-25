import React from 'react'
import PartyCards from '../PartyCards'

import { svgIcon } from '../../../Images/icons'
import { commonwealthAllColors } from '../../../styles/colors'

class CommonwealthPartyCards extends PartyCards {
    renderSelectPartyCardFor = () => <font> Select party card for { this.cut(this.state.playerPartyName) || '' } ({ svgIcon(commonwealthAllColors[this.state.playerParty - 1]) }) </font>
}

export default CommonwealthPartyCards
