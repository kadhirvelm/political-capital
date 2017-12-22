import { _ } from 'underscore'
import { renderSelectFieldAndMenu } from '../../Util/util'

export function commonwealthListOfPlayers(state, handlePlayerSelection){
  const currentPlayerParty = state.players[state.playerName].party
  const playerListWithoutPartyMates = _.filter(_.values(state.players), (player) => player.party !== currentPlayerParty)
  return renderSelectFieldAndMenu(state, handlePlayerSelection, playerListWithoutPartyMates)
}
