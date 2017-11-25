import React from 'react'
import PoliticalCapitalGame from '../Game'
import Flexbox from 'flexbox-react'

import CommonwealthResolutionAndChance from './ResolutionAndChance'
import CommonwealthPartyCards from './PartyCards'
import CommonwealthTools from './Tools'

import { commonwealthAllColors, commonwealthAllColorHexes } from '../../../styles/colors'

class CommonwealthGame extends PoliticalCapitalGame {
  resolutionAndChance = () => <CommonwealthResolutionAndChance playerParty={ this.state.playerParty } { ...this.renderResolutionAndChangeProps() } />
  partyCards = () => <CommonwealthPartyCards { ...this.partyCardProps() } />

  renderNameAndParty = () => {
    return(
      <Flexbox flexBasis='50%' flexDirection='column' alignItems='flex-end'>
        <font> { this.cut(this.state.playerName) } </font>
        <font size={ 2 }> { this.state.playerPartyName && this.cut(this.state.playerPartyName) } </font>
        <font size={ 2 } style={ { borderBottomColor: commonwealthAllColorHexes[this.state.playerParty - 1], borderBottomStyle: 'solid', borderBottomWidth: '2px' } }> { commonwealthAllColors[this.state.playerParty - 1] } </font>
      </Flexbox>
    )
  }

  renderToolsComponent = () => <CommonwealthTools { ...this.toolsProps() } />
}

export default CommonwealthGame
