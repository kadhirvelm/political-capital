import React from 'react'
import ResolutionAndChance from '../ResolutionAndChance'

import { svgIcon } from '../../../Images/icons'
import { _ } from 'underscore'
import { commonwealthAllColors, commonwealthAllColorHexes } from '../../../styles/colors'

class CommonwealthResolutionAndChance extends ResolutionAndChance {
  constructor(props){
    super(props)
    this.state = _.extend(this.state, { playerParty: props.playerParty, playerPartyTitle: commonwealthAllColors[props.playerParty - 1], playerPartyColor: commonwealthAllColorHexes[props.playerParty - 1] })
  }

  resolutionTable = (resolution) => {
    const resolutionObject = resolution[this.state.playerPartyTitle] || resolution.default
    return this.renderResolutionTable(resolutionObject)
  }

  renderResolutionTitle = () => <h1> Resolution ({ svgIcon(this.state.playerPartyTitle, this.state.playerPartyColor) }) </h1>
}

export default CommonwealthResolutionAndChance
