import EndRoundLogistics from '../../Util/EndRoundLogistics'

import { commonwealthListOfPlayers } from './util'

class CommonwealthEndRoundLogistics extends EndRoundLogistics {
    renderTakeStealMessage = () => 'Waiting for players to steal and give.'
    renderListOfPlayerOptions = () => commonwealthListOfPlayers(this.state, this.handlePlayerSelection)
}

export default CommonwealthEndRoundLogistics
