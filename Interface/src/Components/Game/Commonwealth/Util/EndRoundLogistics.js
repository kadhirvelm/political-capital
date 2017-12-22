import React from 'react'

import EndRoundLogistics from '../../Util/EndRoundLogistics'
import { commonwealthListOfPlayers } from './util'

class CommonwealthEndRoundLogistics extends EndRoundLogistics {
    renderTakeStealMessage = () => 'Waiting for players to take/give.'
    renderListOfPlayerOptions = () => commonwealthListOfPlayers(this.state, this.handlePlayerSelection)

    renderPartyCardType = (entry) => {
      return <div> { this.renderType(this.state.round.partyCards[entry].type) }, { this.state.round.partyCards[entry].value } </div>
    }

    checkForStealingAndTaking = () => {
      return this.hasTypeOfCard('Take 20') || this.hasTypeOfCard('Give 20')
    }

    handlePlayerPartyCard = () => {
      if(this.state.selectedPlayer){
        this.state.managingSocket.emit(this.playerPlayedCard(), this.state.selectedPlayer)
        this.state.managingSocket.emit('recordAction', { selectedPlayer: this.state.selectedPlayer, card: this.playerPlayedCard(), confirmed: true })
      }
    }

    hasPlayerStealTakeCard = () => {
      return this.playerPlayedCard() === 'Take 20' || this.playerPlayedCard() === 'Give 20'
    }
}

export default CommonwealthEndRoundLogistics
