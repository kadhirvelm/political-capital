import React from 'react'
import ResolutionAndChance from '../ResolutionAndChance'
import Flexbox from 'flexbox-react'

import { svgIcon } from '../../Images/icons'
import { _ } from 'underscore'
import { commonwealthAllColors, commonwealthAllColorHexes, colors } from '../../styles/colors'

class CommonwealthResolutionAndChance extends ResolutionAndChance {
  constructor(props){
    super(props)
    this.state = _.extend(this.state, { playerParty: props.playerParty, playerPartyTitle: commonwealthAllColors[props.playerParty - 1], playerPartyColor: commonwealthAllColorHexes[props.playerParty - 1] })
  }

  resolutionTable = (resolution) => {
    const resolutionObject = resolution[this.state.playerPartyTitle] || resolution.default
    return(
      <Flexbox flexDirection='column' flexGrow={ 1 } style={ this.state.isOverview ? { width: '250px' } : {} }>
        <Flexbox flexGrow={ 1 } justifyContent='space-around'>
          <Flexbox style={ { marginBottom: '5px', width: '33%' } } />
          <Flexbox style={ { marginBottom: '5px' } }> Passes </Flexbox>
          <Flexbox style={ { marginBottom: '5px' } }> Fails </Flexbox>
        </Flexbox>
        <Flexbox flexGrow={ 1 } justifyContent='space-around'>
          <font size={ 3 } style={ { width: '33%' } }> Vote Yes </font>
          <font style={ this.numberStyle } size={ 4 } color={ colors.GREEN }> { resolutionObject.yes.inFavor } </font>
          <font style={ this.numberStyle } size={ 4 } color={ colors.RED }> { resolutionObject.yes.against } </font>
        </Flexbox>
        <Flexbox flexGrow={ 1 } justifyContent='space-around'>
          <font size={ 3 } style={ { width: '33%' } }> Vote No </font>
          <font size={ 4 } color={ colors.RED }> { resolutionObject.no.against } </font>
          <font size={ 4 } color={ colors.GREEN }> { resolutionObject.no.inFavor } </font>
        </Flexbox>
      </Flexbox>
    )
  }

  renderResolutionTitle = () => <h1> Resolution ({ svgIcon(this.state.playerPartyTitle, this.state.playerPartyColor) }) </h1>
}

export default CommonwealthResolutionAndChance
