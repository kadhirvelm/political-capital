import React, { Component } from 'react'
import Flexbox from 'flexbox-react'

import { resetEverything } from '../../State/ServerActions'
import RaisedButton from 'material-ui/RaisedButton'

import GameOverviewScreen from './GameOverviewScreen'
import CommonwealthGameOverviewScreen from './Commonwealth/CommonwealthGameOverviewScreen'

class GameOverview extends Component {
  goHome = () => {
    this.props.dispatch(resetEverything())
  }

  renderGameOverviewScreen = () => {
    switch(this.props.connectedRoom && this.props.connectedRoom.gameType){
      case 'Commonwealth':
        return <CommonwealthGameOverviewScreen { ...this.props } />
      default:
        return <GameOverviewScreen { ...this.props } />
    }
  }

  render() {
    return (
      <Flexbox flexDirection='column'>
        <RaisedButton label='Home' style={ { position: 'absolute', left: '1%', top: '1%' } } onClick={ this.goHome } />
        { this.props.gameClosed ?
          <Flexbox> Either game session has ended or unable to locate game </Flexbox>
          :
          this.renderGameOverviewScreen()
        }
      </Flexbox>
    )
  }
}

export default GameOverview
