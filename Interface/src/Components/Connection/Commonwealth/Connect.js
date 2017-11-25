import React from 'react'
import Flexbox from 'flexbox-react'

import PoliticalCapitalConnect from '../Connect'
import { commonwealthAllColors, commonwealthAllColorHexes, colors } from '../../../styles/colors'

import { svgIcon } from '../../../Images/icons'
import { _ } from 'underscore'

class CommonwealthConnect extends PoliticalCapitalConnect {
  constructor(props){
    super(props)
    this.allColors = commonwealthAllColors
    this.allColorHexes = commonwealthAllColorHexes
    this.partyType = 'State'
    this.gameType = 'Commonwealth'

    _.extend(this.state, {
      playerParty: props.playerParty ? props.playerParty : Math.floor(Math.random() * (this.allColors.length)) + 1,
    })
  }

  renderPartySelectButtonIcon = () => {
    return svgIcon(this.allColors[this.state.playerParty - 1])
  }

  renderReadyPlayer = (entry) => {
    return(
      <Flexbox flexBasis='50%' flexWrap='wrap' justifyContent='center'>
        <font size={ 4 } color={ colors.DARK_GRAY } style={ entry.isReady ? { fontStyle: 'normal' } : { fontStyle: 'italic' } }> { entry.isReady ? svgIcon(this.fetchColor(entry, true), colors.GREEN) : this.fetchColor(entry, true) } </font>
      </Flexbox>
    )
  }
}

export default CommonwealthConnect