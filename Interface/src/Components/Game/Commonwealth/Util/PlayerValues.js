import PlayerValues from '../../Util/PlayerValues'

export class CommonwealthPlayerValues extends PlayerValues {
    valueBonus = () => {
        return this.partyCardTextTemplate('fails or passes', this.state.selectedPartyCard.value)
    }
}

export default CommonwealthPlayerValues
