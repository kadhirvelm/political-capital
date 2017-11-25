import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'

import { _ } from 'underscore'

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
