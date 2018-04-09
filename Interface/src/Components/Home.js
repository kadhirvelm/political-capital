import React, { Component } from 'react'
import Flexbox from 'flexbox-react'

import PCLogo from '../Images/PCLogo.png'
import GameSetup from '../Images/GameSetup.png'

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
    this.state = Object.assign({}, this.propsConst(props))
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
          <Flexbox flexGrow={ 1 }>
            <ReactCSSTransitionGroup
              transitionName='fade'
              transitionEnterTimeout={ 500 }
              transitionLeaveTimeout={ 500 }>
              { isOpened &&
                <div style={ { marginLeft: '15px', marginBottom: '15px', width: '100%' } } key={ id }>
                  { content }
                </div>
              }
            </ReactCSSTransitionGroup>
          </Flexbox>
        </Flexbox>
      </div>
    )
  }

  renderWhatIsPC(){
    return(
      <Flexbox flexGrow={ 1 }>
        <p>
          Political Capital is a game of relationships and manipulation - or at least that's what we think so far. The game constantly
          changes with each new deck.
          <br /> <br />
          Your group will break up into smaller political parties and vie for power. But beware. This is a dog eat dog world.
          Though you might think your fellow party mates have a vested interest in you, only a single individual can win
          this race.
          <br /> <br />
          Form alliances, betray, bribe, do whatever it takes to come out on top. Good luck!
        </p>
      </Flexbox>
    )
  }

  renderHowIsItPlayed(isMobile){
    return(
      <Flexbox flexGrow={ 1 } flexDirection='column'>
        As with other resync games, Political Capital blends a board game with technology. The goal is for all players to focus on
        their interactions with other players without being bogged down by the rules of the game. The technology involved with ensure
        that all players will always know what to do next.
        <br /> <br />
        <Flexbox flexDirection={ isMobile ? 'column' : 'row' }>
          <Flexbox flexGrow={ 1 } flexBasis={ isMobile ? '100%' : '50%' } justifyContent='center'>
          Here's our recommendation for the best game experience. First, launch a game from the host's tablet or laptop, then plug said device into a central television screen.
          This will display the game overview screen. Next, have each person join the game through their smartphone. That's it!
          </Flexbox>
          <Flexbox flexGrow={ 1 } flexBasis={ isMobile ? '100%' : '50%' } justifyContent='center' style={ { margin: '15px' } }>
            <img src={ GameSetup } alt='Game Setup' width='500px' height='237px' style={ isMobile ? { marginTop: '15px', borderRadius: '5px' } : { borderRadius: '5px' } } />
          </Flexbox>
        </Flexbox>
      </Flexbox>
    )
  }

  renderVideoEmbed(){
    return(
      <Flexbox flexGrow={ 1 } justifyContent='center' style={ { background: 'green' } }>
        <iframe title='Explainer' width="560" height="315" src="https://www.youtube-nocookie.com/embed/HnaIjNhiXFs?rel=0" frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen></iframe>
      </Flexbox>
    )
  }

  renderLearningScreen = (isMobile) => {
    return(
      <div key='Learning Screen'>
        <RaisedButton label={ (<h2> Back</h2>) } onClick={ this.handleOnClick('Home') } primary={ true } style={ { position: 'absolute', top: '20px', left: '20px', width: '10vw', height: '5vw' } } labelColor='white' labelStyle={ { fontSize: '2vw', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' } } />
        <Flexbox flexDirection='column' style={ { top: '10%', marginTop: '15px', width: '95%', height: '93%', position: 'absolute', left: '50%', transform: 'translateX(-50%)' } }>
          { this.renderOpeningDiv('What is Political Capital?', this.renderWhatIsPC(), 'What Is It') }
          { this.renderOpeningDiv('How is it Played?', this.renderHowIsItPlayed(isMobile), 'How Played') }
          { this.renderOpeningDiv((<div> How to Play Political Capital - Instructional Video </div>), this.renderVideoEmbed(), 'Video') }
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
            this.renderLearningScreen(isMobile)
            :
            this.renderBasicScreen(isMobile)
          }
        </ReactCSSTransitionGroup>
      </Flexbox>
    )
  }
}

export default PoliticalCapitalGame
