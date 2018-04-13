import React, { Component } from 'react'
import Flexbox from 'flexbox-react'

import GameCreation from '../GameCreation'

import { commonwealthAllColors, commonwealthAllColorHexes } from '../../../styles/colors'
import { svgIcon } from '../../../Images/icons'

class CommonwealthGameCreation extends Component {
  settings(){
    return [
      { name: 'Start Senators', key: 'START_SENATORS', max: 10, min: 3 },
      { name: 'Initial Capital', key: 'START_CAPITAL', max: 120, min: 0 },
      { name: 'Senate Tax', key: 'SENATE_TAX', max: 40, min: 0 },
    ]
  }

  renderPlayerSelecting(player){
    const party = commonwealthAllColors[player.party - 1]
    return <font> { player.isReady ? <Flexbox alignItems='center'> { party } { svgIcon(party) } </Flexbox> : 'Selecting...' } </font>
  }

  render() {
    return (
      <Flexbox id='Commonwealth Setup' flexDirection='column' flexGrow={ 1 } className='no-moving'>
        <GameCreation
          allColors={ commonwealthAllColors }
          allColorHexes={ commonwealthAllColorHexes }
          settings={ this.settings }
          renderPlayerSelecting={ this.renderPlayerSelecting }
          { ...this.props }
        />
      </Flexbox>
    )
  }
}

export default CommonwealthGameCreation
