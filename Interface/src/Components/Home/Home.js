import React, { Component } from 'react'
import Flexbox from 'flexbox-react'

import PCLogo from '../../Images/PCLogo.png'
import LearnMore from './LearnMore'

import { isJoiningRoom, isCreatingRoom } from '../../State/ServerActions'

import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import RaisedButton from 'material-ui/RaisedButton'

import '../../styles/global.css'
import './Home.css'
import { labelStyle, mainButtonStyle, mobileButtonStyle } from '../../styles/global-consts'

class PoliticalCapitalGame extends Component {
  constructor(props){
    super(props)
    this.state = Object.assign({}, this.propsConst(props))
  }

  propsConst(props){
    return({
      dispatch: props.dispatch,
    })
  }

  handleOnClick = (key) => {
    return () => {
      switch(key){
        case 'Learning':
          this.setState({ isLearning: true })
          break
        case 'Join':
          this.state.dispatch(isJoiningRoom())
          break
        case 'Create':
          this.state.dispatch(isCreatingRoom())
          break
        case 'Home':
          this.setState({ isLearning: false })
          break
        default:
          break
      }
    }
  }

  renderActionItem(isMobile, buttonCommand, errorText){
    const isDisabled = (buttonCommand === 'Create' && isMobile) || (buttonCommand === 'Join' && !isMobile)
    return(
      <Flexbox flexDirection='column' alignItems='center' className={ !isDisabled ? 'blinker' : '' }>
        <RaisedButton primary={ !isDisabled } disabled={ isDisabled } onClick={ this.handleOnClick(buttonCommand) } label={ (<h2> { buttonCommand } </h2>) } style={ Object.assign({}, mainButtonStyle, isMobile ? mobileButtonStyle : {}) } labelColor='#424949' labelStyle={ labelStyle } />
        { isDisabled && <font color='red'> { errorText } </font> }
      </Flexbox>
    )
  }

  renderBasicScreen = (isMobile) => {
    return(
      <div key='Basic Screen' style={ { top: '40%', left: '50%', transform: 'translate(-50%, -50%)', position: 'absolute' } }>
        <Flexbox flexGrow={ 1 } justifyContent='center' alignItems='center'>
          <img src={ PCLogo } alt='PC' style={ { width: '12vmin', height: '12vmin', marginRight: '15px' } } />
          <h1 style={ { textAlign: 'center' } }> Welcome to <br /> Political Capital </h1>
        </Flexbox>
        <Flexbox flexDirection={ isMobile ? 'column' : 'row' } justifyContent='center' alignItems='baseline'>
          <RaisedButton onClick={ this.handleOnClick('Learning') } label={ (<h2>Learn</h2>) } style={ Object.assign({}, mainButtonStyle, isMobile ? mobileButtonStyle : {}) } labelColor='#424949' labelStyle={ labelStyle } />
          { this.renderActionItem(isMobile, 'Join', 'Only mobile devices can be players.') }
          { this.renderActionItem(isMobile, 'Create', 'This screen is not large enough to create a game.') }
        </Flexbox>
      </div>
    )
  }

  render() {
    const isMobile = window.innerWidth < 800 || window.innerHeight < 600
    return (
      <Flexbox id='Home Screen' flexDirection='column'>
        <ReactCSSTransitionGroup
          transitionName='fade'
          transitionEnterTimeout={500}
          transitionLeaveTimeout={500}>
          { this.state.isLearning ?
            <LearnMore isMobile={ isMobile } handleOnClick={ this.handleOnClick } />
            :
            this.renderBasicScreen(isMobile)
          }
        </ReactCSSTransitionGroup>
      </Flexbox>
    )
  }
}

export default PoliticalCapitalGame
