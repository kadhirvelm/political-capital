import React, { Component } from 'react'
import Flexbox from 'flexbox-react'

import PoliticalCapitalConnect from '../Connect'
import { commonwealthAllColors, commonwealthAllColorHexes, colors } from '../../../styles/colors'

import { svgIcon } from '../../../Images/icons'

class CommonwealthConnect extends Component {
  constructor(props){
    super(props)
    this.allColors = commonwealthAllColors
    this.allColorHexes = commonwealthAllColorHexes
    this.partyType = 'State'
    this.gameType = 'Commonwealth'
  }

  renderPartySelectButtonIcon(){
    return svgIcon(this.allColors[this.connectRef.state.playerParty - 1])
  }

  settings(){
    return [
      { name: 'Start Senators', key: 'START_SENATORS', max: 10, min: 3 },
      { name: 'Initial Capital', key: 'START_CAPITAL', max: 120, min: 0 },
      { name: 'Senate Tax', key: 'SENATE_TAX', max: 40, min: 0 },
    ]
  }

  renderReadyPlayer = (entry) => {
    return(
      <Flexbox flexBasis='50%' flexWrap='wrap' justifyContent='center'>
        <font size={ 4 } color={ colors.DARK_GRAY } style={ entry.isReady ? { fontStyle: 'normal' } : { fontStyle: 'italic' } }> { entry.isReady ? svgIcon(this.connectRef.fetchColor(entry, true), colors.GREEN) : this.connectRef.fetchColor(entry, true) } </font>
      </Flexbox>
    )
  }

  settingPoliticalCapitalConnectRef = (instance) => {
    this.connectRef = instance
  }

  render(){
    return(
      <PoliticalCapitalConnect
        ref={ this.settingPoliticalCapitalConnectRef }
        allColors={ this.allColors }
        allColorHexes={ this.allColorHexes }
        partyType={ this.partyType }
        gameType={ this.gameType }
        renderPartySelectButtonIcon={ this.renderPartySelectButtonIcon }
        settings={ this.settings }
        renderReadyPlayer={ this.renderReadyPlayer }
        {...this.props} />
    )
  }
}

export default CommonwealthConnect
