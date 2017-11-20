import React from 'react'
import Tools from '../Tools'

import { TableRowColumn } from 'material-ui/Table'
import { svgIcon } from '../../Images/icons'
import { commonwealthAllColors, commonwealthAllColorHexes } from '../../styles/colors'
import { _ } from 'underscore'

class CommonwealthTools extends Tools {
  constructor(props){
    super(props)
    this.allColorHexes = commonwealthAllColorHexes
  }

  returnPartyTypeFromName = (partyName) => {
    return commonwealthAllColors[parseInt(_.findKey(this.state.parties, (party) => party.partyName === partyName), 10) - 1]
  }

  renderPartyNameInPartyBreakdown = (party) => <TableRowColumn style={ { wordWrap: 'break-word', whiteSpace: 'normal' } }> <font> { svgIcon(this.returnPartyTypeFromName(party.partyName)) } </font> </TableRowColumn>
}

export default CommonwealthTools
