import React from 'react'
import PoliticalCapitalGame from '../Game'
import Flexbox from 'flexbox-react'

import CommonwealthResolutionAndChance from './ResolutionAndChance'
import CommonwealthPartyCards from './PartyCards'
import CommonwealthTools from './Tools'

import { commonwealthAllColors, commonwealthAllColorHexes } from '../../../styles/colors'

class CommonwealthGame extends PoliticalCapitalGame {
  resolutionAndChance = () => <CommonwealthResolutionAndChance playerParty={ this.state.playerParty } managingSocket={ this.state.managingSocket } round={ this.state.rounds[this.state.currentRound] } currentRound={ this.state.currentRound } />
  partyCards = () => <CommonwealthPartyCards id='PartyCards' dispatch={ this.state.dispatch } managingSocket={ this.state.managingSocket } parties={ this.state.parties } round={ this.state.rounds[this.state.currentRound] } playerParty={ this.state.playerParty } playerPartyName={ this.state.playerPartyName } selectedPartyCard={ this.state.selectedPartyCard } />

  renderNameAndParty = () => {
    return(
      <Flexbox flexBasis='50%' flexDirection='column' alignItems='flex-end'>
        <font> { this.cut(this.state.playerName) } </font>
        <font size={ 2 }> { this.state.playerPartyName && this.cut(this.state.playerPartyName) } </font>
        <font size={ 2 } style={ { borderBottomColor: commonwealthAllColorHexes[this.state.playerParty - 1], borderBottomStyle: 'solid', borderBottomWidth: '2px' } }> { commonwealthAllColors[this.state.playerParty - 1] } </font>
      </Flexbox>
    )
  }

  renderToolsComponent = () => <CommonwealthTools managingSocket={ this.state.managingSocket } rounds={ this.state.rounds } parties={ this.state.parties } players={ this.state.players } playerName={ this.state.playerName } playerParty={ this.state.playerParty }
    playerPartyName={ this.state.playerPartyName } connectedRoom={ this.state.connectedRoom } currentRound={ this.state.currentRound }
    openTryingToDisconnect={ this.openTryingToDisconnect } />
}

export default CommonwealthGame
