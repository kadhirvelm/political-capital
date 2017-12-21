import { _ } from 'underscore'
import { renderSelectFieldAndMenu } from '../../Util/util'

export function commonwealthListOfPlayers(state, handlePlayerSelection){
  const playerListWithoutPartyMates = _.filter(_.values(state.players), (player) => player.party !== state.playerParty)
  return renderSelectFieldAndMenu(state, handlePlayerSelection, playerListWithoutPartyMates)
}
