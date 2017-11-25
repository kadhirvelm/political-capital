import React from 'react'
import Flexbox from 'flexbox-react'

import PoliticalCapitalConnect from '../PoliticalCapitalConnect'
import { commonwealthAllColors, commonwealthAllColorHexes, colors } from '../../../styles/colors'

import RaisedButton from 'material-ui/RaisedButton'
import IconButton from 'material-ui/IconButton'

import { svgIcon } from '../../../Images/icons'
import { _ } from 'underscore'

class CommonwealthConnect extends PoliticalCapitalConnect {
  constructor(props){
    super(props)
    this.allColors = commonwealthAllColors
    this.allColorHexes = commonwealthAllColorHexes
    this.partyType = 'State'
    this.gameType = 'Commonwealth'

    _.extend(this.state, {
      playerParty: props.playerParty ? props.playerParty : Math.floor(Math.random() * (this.allColors.length)) + 1,
    })
  }

  renderPlayerPartyPicker = () => {
    return(
      <Flexbox flexDirection='column'>
        <Flexbox alignItems='center' justifyContent='center'>
          <Flexbox>
            { !this.state.playerReady && <IconButton onTouchTap={ this.curryChangePlayerParty(false) }> { svgIcon('arrow_left') } </IconButton> }
          </Flexbox>
          <Flexbox flexBasis='75%'>
            <RaisedButton fullWidth={ true } label={ this.allColors[this.state.playerParty - 1] } icon={ svgIcon(this.allColors[this.state.playerParty - 1]) } backgroundColor={ this.allColorHexes[this.state.playerParty - 1] } onTouchTap={ !this.state.playerReady && this.curryChangePlayerParty(true) } style={ { width: '20%', margin: '3px' } } />
          </Flexbox>
          <Flexbox>
            { !this.state.playerReady && <IconButton onTouchTap={ this.curryChangePlayerParty(true) }> { svgIcon('arrow_right') } </IconButton> }
          </Flexbox>
        </Flexbox>
      </Flexbox>
    )
  }

  renderReadyPlayer = (entry) => {
    return(
      <Flexbox flexBasis='50%' flexWrap='wrap' justifyContent='center'>
        <font size={ 4 } color={ colors.DARK_GRAY } style={ entry.isReady ? { fontStyle: 'normal' } : { fontStyle: 'italic' } }> { entry.isReady ? svgIcon(this.fetchColor(entry, true), colors.GREEN) : this.fetchColor(entry, true) } </font>
      </Flexbox>
    )
  }

  render(){
    return(
      <Flexbox id='Room Setup' flexDirection='column' flexGrow={ 1 }>
        { this.renderHeaders() }
        { this.renderPlayerPartyPicker() }
        { this.renderPlayers() }
        { this.renderReadyButton() }
        { this.renderSettings() }
        { this.renderSubmitNameDialog() }
      </Flexbox>
    )
  }
}

export default CommonwealthConnect
