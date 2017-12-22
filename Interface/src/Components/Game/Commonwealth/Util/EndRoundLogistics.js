import React from 'react'

import EndRoundLogistics from '../../Util/EndRoundLogistics'
import { commonwealthListOfPlayers } from './util'

class CommonwealthEndRoundLogistics extends EndRoundLogistics {
    renderTakeStealMessage = () => 'Waiting for players to steal and give.'
    renderListOfPlayerOptions = () => commonwealthListOfPlayers(this.state, this.handlePlayerSelection)

    renderPartyCardType = (entry) => {
        console.log(entry)
        return <div> { this.renderType(this.state.round.partyCards[entry].type) }, { this.state.round.partyCards[entry].value } </div>
    }
}

export default CommonwealthEndRoundLogistics
