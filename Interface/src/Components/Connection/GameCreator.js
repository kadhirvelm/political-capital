import React, { Component } from 'react'
import Flexbox from 'flexbox-react'

import GameCreationDialog from './GameCreationDialog'
import '../../styles/global.css'

import { colors, allColors, allColorHexes } from '../../styles/colors'
import { _ } from 'underscore'

import GameCreation from './GameCreation'
import CommonwealthGameCreation from './Commonwealth/CommonwealthGameCreation'

class GameCreator extends Component {
  constructor(props){
    super(props)
    this.colors = colors
    this.allColors = props.allColors || allColors
    this.allColorHexes = props.allColorHexes || allColorHexes
    this.state = this.propsConst(this.props)
  }

  propsConst(props){
    return {
      dispatch: props.dispatch,
      connectedRoom: props.connectedRoom || (this.state && this.state.connectedRoom),
      isCreatingRoom: _.isUndefined(props.connectedRoom),
    }
  }

  componentWillReceiveProps(nextProps){
    this.setState(this.propsConst(nextProps))
  }

  renderGameCreation = () => {
    switch(this.state.connectedRoom.gameType){
      case 'Commonwealth':
        return <CommonwealthGameCreation { ...this.props } />
      default:
        return <GameCreation { ...this.props } />
    }
  }

  render() {
    console.log(this.state.isCreatingRoom, this.state.connectedRoom)
    return (
      <Flexbox id='Room Setup' flexDirection='column' flexGrow={ 1 } className='no-moving'>
        { this.state.isCreatingRoom ?
          <GameCreationDialog resetToHome={ this.resetToHome } {...this.props } />
          :
          this.renderGameCreation()
        }
      </Flexbox>
    )
  }
}

export default GameCreator
