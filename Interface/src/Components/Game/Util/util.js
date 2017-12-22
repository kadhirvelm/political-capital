import React from 'react'

import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'

import { colors } from '../../../styles/colors'

import { _ } from 'underscore'
import { sum, curry, sortWith, descend } from 'ramda'

export function renderSelectFieldAndMenu(state, handlePlayerSelection, players){
  return(
    <SelectField value={ state.selectedPlayer } floatingLabelText='Select Player' onChange={ handlePlayerSelection }>
      { players.map((player) => (
        <MenuItem key={ player.name } value={ player.name } primaryText={ player.name } />
      ))
      }
    </SelectField>
  )
}

export function listOfPlayers(state, handlePlayerSelection){
  const playerListWithoutSelf = _.filter(_.values(state.players), (player) => player.name !== state.playerName)
  return renderSelectFieldAndMenu(state, handlePlayerSelection, playerListWithoutSelf)
}

export function returnWinner(state) {
  return (state.previousRound || state.round).roundWinner === 'yes' ? <font color={ colors.GREEN }> Passes </font> : <font color={ colors.RED }> Fails </font>
}

function totalPartyAverageWorth(state, party){
  return sum(_.map(party.players, (player) => state.rounds[state.currentRound].currentRoundStats[player].politicalCapital)) / party.players.length
}
const curryTotalPartyAverageWorth = curry(totalPartyAverageWorth)
export const sortPartiesOnAveragePartyWorth = (state, values) => sortWith([ descend(curryTotalPartyAverageWorth(state)) ])(values)

export const basePartyStyle = {
  background: '#FFFFFF',
  borderRadius: '10px',
  borderColor: colors.LIGHT_GRAY,
  borderStyle: 'solid',
  borderWidth: '1px',
  margin: '10px',
  padding: '10px',
  height: 250,
  minWidth: '125px',
  width: '30%',
}

export const selectedPartyStyle = _.extend(_.clone(basePartyStyle), {
  borderColor: '#F2BD1E',
  background: '#FFECB5',
  borderStyle: 'solid',
  borderWidth: '3px',
  height: 250,
  minWidth: '125px',
  width: '30%',
})
