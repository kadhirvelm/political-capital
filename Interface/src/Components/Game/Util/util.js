import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'

import { colors } from '../../../styles/colors'

import { _ } from 'underscore'
import { sum } from 'ramda'

export function listOfPlayers(state, handlePlayerSelection){
  return(
    <SelectField value={ state.selectedPlayer } floatingLabelText='Select Player' onChange={ handlePlayerSelection }>
      { _.filter(_.values(state.players), (player) => player.name !== state.playerName).map((player) => (
        <MenuItem key={ player.name } value={ player.name } primaryText={ player.name } />
      ))
      }
    </SelectField>
  )
}

export function returnWinner(state) {
  return state.previousRound.roundWinner === 'yes' ? <font color={ colors.GREEN }> Passes </font> : <font color={ colors.RED }> Fails </font>
}

export function totalPartyAverageWorth(party){
  return sum(_.map(party.players, (player) => this.state.rounds[this.state.currentRound].currentRoundStats[player].politicalCapital)) / party.players.length
}
