import React, { Component } from 'react'
import Flexbox from 'flexbox-react'

import GameSetup from '../../Images/GameSetup.png'

import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import RaisedButton from 'material-ui/RaisedButton'
import IconButton from 'material-ui/IconButton'

import { svgIcon } from '../../Images/icons'

import '../../styles/global.css'
import './Home.css'
import { backLabelStyle, backButtonStyle } from '../../styles/global-consts'

class LearnMore extends Component {
  constructor(props){
    super(props)
    this.state = Object.assign({}, this.propsConst(props))
  }

  propsConst(props){
    return({
      isMobile: props.isMobile,
      handleOnClick: props.handleOnClick,
    })
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
              style={ { width: '100%' } }
              transitionName='fade'
              transitionEnterTimeout={500}
              transitionLeaveTimeout={500}>
              { isOpened &&
                <div style={ { width: '100%' } } key={ id }>
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
      <Flexbox flexGrow={ 1 } style={ { marginLeft: '15px' } }>
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
      <Flexbox flexGrow={ 1 } flexDirection='column' style={ { marginLeft: '10px' } }>
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
      <Flexbox justifyContent='center' style={ { marginTop: '10px', marginBottom: '10px', width: '100%' } }>
        <iframe style={ { display: 'block' } } title='Explainer' width="560" height="315" src="https://www.youtube-nocookie.com/embed/HnaIjNhiXFs?rel=0" frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen></iframe>
      </Flexbox>
    )
  }

  renderPoliticalCapitalRules(){
    return(
      <Flexbox style={ { marginBottom: '15px' } } justifyContent='center'>
        <iframe title='Google Docs' width='95%' height='600vh' src="https://docs.google.com/document/d/e/2PACX-1vTjOK_pR3bse95J29w5uawQ_Mq26UDKL5kMQ3HPs_wpYnbl2QQ0EBRs467HzwchMbPv68NQBZzXMvh2/pub?embedded=true"></iframe>
      </Flexbox>
    )
  }

  renderLearningScreen = () => {
    return(
      <div key='Learning Screen'>
        <RaisedButton label={ (<h2> Back </h2>) } onClick={ this.state.handleOnClick('Home') } primary={ true } style={ backButtonStyle } labelColor='white' labelStyle={ backLabelStyle } />
        <Flexbox flexDirection='column' style={ { top: '10%', marginTop: '15px', width: '95%', height: '93%', position: 'absolute', left: '50%', transform: 'translateX(-50%)' } }>
          { this.renderOpeningDiv('What is Political Capital?', this.renderWhatIsPC(), 'What Is It') }
          { this.renderOpeningDiv('How is it Played?', this.renderHowIsItPlayed(this.state.isMobile), 'How Played') }
          { this.renderOpeningDiv((<div> How to Play Political Capital - Instructional Video </div>), this.renderVideoEmbed(), 'Video') }
          { this.renderOpeningDiv('Political Capital Rules', this.renderPoliticalCapitalRules(), 'Rules') }
        </Flexbox>
      </div>
    )
  }

  render() {
    return (
      <Flexbox id='Home Screen' flexDirection='column'>
        { this.renderLearningScreen() }
      </Flexbox>
    )
  }
}

export default LearnMore
