import React, { Component } from 'react'
import GameOverviewScreen from '../GameOverviewScreen'

import Flexbox from 'flexbox-react'

import { svgIcon } from '../../../Images/icons'
import { commonwealthAllColors, commonwealthAllColorHexes } from '../../../styles/colors'

class CommonwealthGameOverviewScreen extends Component {

  renderPartyAffiliation = (party) => {
    return svgIcon(commonwealthAllColors[party - 1])
  }

  renderPartyDetail = (value, key) => {
    return(this.overviewScreenRef &&
      <Flexbox alignItems='baseline'>
        <font size={ 5 } color={ commonwealthAllColorHexes[key - 1] }> { value.partyName } </font>
        <div style={ { marginLeft: '6px' } }> { this.renderPartyAffiliation(key) } </div>
        <div style={ { marginLeft: '7px' } }> { this.overviewScreenRef.currentRoundPartyCardsContainsParty(value.partyName) && svgIcon('smallCheckmark') } </div>
      </Flexbox>
    )
  }

  setOverviewScreenRef = (instance) => this.overviewScreenRef = instance

  render() {
    return (
      <GameOverviewScreen
        ref={ this.setOverviewScreenRef }
        renderPartyDetail={ this.renderPartyDetail }
        { ...this.props }
      />
    )
  }
}

export default CommonwealthGameOverviewScreen
