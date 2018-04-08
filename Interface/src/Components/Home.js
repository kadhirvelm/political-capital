import React, { Component } from 'react'
import Flexbox from 'flexbox-react'
import PCLogo from '../Images/PCLogo.png'

import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import RaisedButton from 'material-ui/RaisedButton'
import IconButton from 'material-ui/IconButton'

import { svgIcon } from '../Images/icons'

import '../styles/global.css'
import './Home.css'

const mainButtonStyle = {
  width: '25vw',
  height: '13vh',
  margin: '10px',
  fontSize: '5vmin',
}

const mobileButtonStyle = {
  width: '75vw',
}

const labelStyle = {
  fontSize: '3.5vw',
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
}

class PoliticalCapitalGame extends Component {
  constructor(props){
    super(props)
    this.state = Object.assign({}, this.propsConst(props), {
      isLearning: true,
      openedQuestion: 'What Is It',
    })
  }

  propsConst(props){
    return({
      dispatch: props.dispatch,
      changeWindowLocation: props.changeWindowLocation,
    })
  }

  handleOnClick = (key) => {
    return () => {
      switch(key){
        case 'Learning':
          this.setState({ isLearning: true })
          break
        case 'Joining':
          this.state.changeWindowLocation('connect')
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

  handleOpeningLearning = (id) => {
    return () => this.setState({ openedQuestion: this.state.openedQuestion === id ? '' : id })
  }

  renderOpeningDiv = (question, content, id) => {
    const isOpened = (this.state.openedQuestion === id)
    return(
      <div className='drop-div'>
        <Flexbox id={ id } flexDirection='column' onClick={ this.handleOpeningLearning(id) }>
          <Flexbox alignItems='center'>
            <Flexbox flexGrow={ 1 } justifyContent='center'> <h3 style={ { textAlign: 'center' } }> { question } </h3> </Flexbox>
            <IconButton id={ id } style={ { marginRight: '2px' } }>
              { svgIcon(isOpened ? 'circle_down' : 'circle_right', isOpened ? 'red' : '') }
            </IconButton>
          </Flexbox>
          <Flexbox style={ { marginLeft: '15px', marginBottom: '15px' } }>
            <ReactCSSTransitionGroup
              transitionName='fade'
              transitionEnterTimeout={ 500 }
              transitionLeaveTimeout={ 500 }>
              { isOpened &&
                <div key={ id }>
                  { content }
                </div>
              }
            </ReactCSSTransitionGroup>
          </Flexbox>
        </Flexbox>
      </div>
    )
  }

  renderLearningScreen = () => {
    return(
      <div key='Learning Screen'>
        <RaisedButton label={ (<h2> Back</h2>) } onClick={ this.handleOnClick('Home') } primary={ true } style={ { position: 'absolute', top: '20px', left: '20px', width: '10vw', height: '5vw' } } labelColor='white' labelStyle={ { fontSize: '2vw', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' } } />
        <Flexbox flexDirection='column' style={ { top: '10%', width: '95%', height: '93%', position: 'absolute' } }>
          { this.renderOpeningDiv('What is Political Capital?', 'Some ContentSome ContentSome ContentSome ContentSome ContentSome ContentSome ContentSome ContentSome ContentSome ContentSome ContentSome ContentSome ContentSome ContentSome ContentSome ContentSome ContentSome ContentSome ContentSome ContentSome ContentSome ContentSome ContentSome ContentSome ContentSome ContentSome ContentSome ContentSome ContentSome ContentSome ContentSome ContentSome ContentSome ContentSome ContentSome ContentSome ContentSome ContentSome ContentSome ContentSome ContentSome Content', 'What Is It') }
          { this.renderOpeningDiv('How is it Played?', 'Some Content', 'How Played') }
          { this.renderOpeningDiv((<div> How to Play Political Capital - Instructional Video </div>), 'Some Content', 'Video') }
          { this.renderOpeningDiv('Political Capital Rules', 'Some Content', 'Rules') }
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
            this.renderLearningScreen()
            :
            this.renderBasicScreen(isMobile)
          }
        </ReactCSSTransitionGroup>
      </Flexbox>
    )
  }
}

export default PoliticalCapitalGame
