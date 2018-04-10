import React, { Component } from 'react'
import Flexbox from 'flexbox-react'

import PCLogo from '../../Images/PCLogo.png'
import LearnMore from './LearnMore'

import { isJoiningRoom } from '../../State/ServerActions'

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
        case 'Joining':
          this.state.dispatch(isJoiningRoom())
          break
        case 'Creating':
          this.state.changeWindowLocation('rooms')
          break
        case 'Home':
          this.setState({ isLearning: false })
          break
        default:
          break
      }
    }
  }

  renderBasicScreen = (isMobile) => {
    return(
      <div key='Basic Screen' style={ { top: '40%', left: '50%', transform: 'translate(-50%, -50%)', position: 'absolute' } }>
        <Flexbox flexGrow={ 1 } justifyContent='center' alignItems='center'>
          <img src={ PCLogo } alt='PC' style={ { width: '12vmin', height: '12vmin', marginRight: '15px' } } />
          <h1 style={ { textAlign: 'center' } }> Welcome to <br /> Political Capital </h1>
        </Flexbox>
        <Flexbox flexDirection={ isMobile ? 'column' : 'row' } justifyContent='center' alignItems='center'>
          <RaisedButton onClick={ this.handleOnClick('Learning') } label={ (<h2>Learn</h2>) } style={ Object.assign({}, mainButtonStyle, isMobile ? mobileButtonStyle : {}) } labelColor='#424949' labelStyle={ labelStyle } />
          <RaisedButton onClick={ this.handleOnClick('Joining') } label={ (<h2>Join</h2>) } primary={ true } style={ Object.assign({}, mainButtonStyle, isMobile ? mobileButtonStyle : {}) } labelColor='white' labelStyle={ labelStyle } />
          <RaisedButton onClick={ this.handleOnClick('Creating') } label={ (<h2>Create</h2>) } style={ Object.assign({}, mainButtonStyle, isMobile ? mobileButtonStyle : {}) } labelColor='#424949' labelStyle={ labelStyle } />
        </Flexbox>
      </div>
    )
  }

  render() {
    const isMobile = window.innerWidth < 700
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
