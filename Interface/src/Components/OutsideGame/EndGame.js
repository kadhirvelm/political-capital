import React, { Component } from 'react'
import Flexbox from 'flexbox-react'
import { colors } from '../../styles/colors'
import { svgIcon } from '../../Images/icons'
import '../../styles/Transitions.css'

// import Sound from 'react-sound'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import { changeEndGameStatus } from '../../State/ServerActions'

import { _ } from 'underscore'

import createPlotlyComponent from 'react-plotlyjs'
const Plotly = require('plotly.js/dist/plotly')
const PlotlyComponent = createPlotlyComponent(Plotly)

class EndGame extends Component {
  constructor(props){
    super(props)
    this.state = Object.assign({}, this.propsConst(props), {
      showStatuses: !props.hasSeenTabulation,
      status: 0,
      dispatch: props.dispatch,
      isOverviewScreen: props.isOverviewScreen || false,
      playSound: true,
      finalPlayers: props.endGame.finalWinners.sortedPlayers.reverse(),
      finalParties: props.endGame.finalWinners.sortedParties.reverse(),
    })
  }

  propsConst = (props) => {
    return({
      endGame: props.endGame,
      disconnect: props.disconnect,
    })
  }

  componentDidMount(){
    this.changeStatus()
  }

  trace1 = (politicalCapital, name) => {
    return ({
      x: _.range(1, politicalCapital.length + 1),
      y: politicalCapital,
      name: name,
    })
  }

  allPlayerValues = () => {
    const allPlayersHistory = _.pluck(_.values(this.state.endGame.rounds), 'currentRoundStats')

    return _.map(_.keys(this.state.endGame.players), (name) => {
      const singlePlayerHistory = _.flatten(_.map(_.map(allPlayersHistory, (singleRound) => _.pick(singleRound, name)), (object) => _.values(object)))
      const politicalCapital = _.pluck(singlePlayerHistory, 'politicalCapital')
      const senators = _.pluck(singlePlayerHistory, 'senators')
      return { name: name, politicalCapital: politicalCapital, senators: senators }
    })
  }

  politicalCapitalData = () => {
    return _.map(this.allPlayerValues(), (singlePlayer) => this.trace1(singlePlayer.politicalCapital, singlePlayer.name))
  }

  senatorData = () => {
    return _.map(this.allPlayerValues(), (singlePlayer) => this.trace1(singlePlayer.senators, singlePlayer.name))
  }

  layout = (title) => {
    return ({
      showlegend: true,
      legend: {
        x: -25,
        y: -25,
        borderwidth: 0.1,
      },
      autosize: true,
      title: title,
      xaxis: {
        title: 'Rounds',
      },
      yaxis: {
        title: title,
      },
    })
  }

  config = () => {
    return (
      {
        showLink: false,
        displayModeBar: !_.isUndefined(this.state.overrideProps),
      }
    )
  }

  changeStatus = () => {
    _.delay(() => {
      if(this.state.status < this.statuses.length - 1){
        let status = this.state.status
        this.setState({ status: ++status }, () => {
          this.changeStatus()
        })
      } else {
        this.setState({ showStatuses: false }, () => {
          if(!this.state.isOverviewScreen){
            this.state.dispatch(changeEndGameStatus(true))
          }
        })
      }
    }, 2700)
  }

  statuses = [ { text: 'Collecting Final Votes', color: colors.RED }, { text: 'Tabulating', color: colors.ORANGE }, { text: 'Calculating Final Results', color: colors.GREEN } ]

  changePlaySound = () => {
    this.setState({ playSound: false })
  }

  renderPlace = (place) => {
    let color
    switch(place){
      case 1:
        color = colors.LIGHT_BLUE
        break
      case 2:
        color = colors.MEDIUM_BLUE
        break
      case 3:
        color = colors.DARK_BLUE
        break
      default:
        color = colors.DARK_GRAY
        break
    }
    return(
      <font size={ place <= 3 ? 6 - place : 2 } color={ color }> { place } </font>
    )
  }

  renderLoadingScreen = () => {
    return(
      <Flexbox key='Status' flexDirection='column' alignItems='center'>
        <font color={ colors.DARK_GRAY }> Loading Results... </font>
        <ReactCSSTransitionGroup
          transitionName='fade-wait'
          transitionEnterTimeout={ 500 }
          transitionLeaveTimeout={ 500 }
        >
          <font key={ this.state.status } color={ this.statuses[this.state.status].color } size={ 4 }> { this.statuses[this.state.status].text } </font>
        </ReactCSSTransitionGroup>
      </Flexbox>
    )
  }

  renderAdditionalOverviewScreenComponent = () => {
    return(
      <Flexbox flexDirection='column' flexGrow={ 1 } style={ { marginTop: '10px' } }>
        <PlotlyComponent data={ this.politicalCapitalData() } layout={ this.layout('Poltical Capital') } config={ this.config() } />
        <div style={ { margin: '10px' } } />
        <PlotlyComponent data={ this.senatorData() } layout={ this.layout('Senators') } config={ this.config() } />
        { /* this.state.playSound && <Sound url='https://s3-us-west-1.amazonaws.com/political-capital/Game.mp3' playFromPosition={ 4000 } playStatus={ 'PLAYING' } onFinishedPlaying={ this.changePlaySound } /> -- Error with Safari 11 */ }
      </Flexbox>
    )
  }

  renderPoliticalCapitalValue = (index, name, capital) => {
    return(
      <Flexbox flexGrow={ 1 } justifyContent='space-around'>
        <Flexbox flexGrow={ 1 } alignItems='center' justifyContent='flex-start'>
          <div> { this.renderPlace(index + 1) } </div>
          <font style={ { marginLeft: '10px' } }> { name } </font>
        </Flexbox>
        <Flexbox alignItems='center' style={ { marginLeft: '15px' } }>
          <div> { svgIcon('coinDollar') } </div>
          <font style={ { marginLeft: '10px' } } color={ capital > 0 ? colors.GREEN : colors.RED }> { capital } </font>
        </Flexbox>
      </Flexbox>
    )
  }

  renderFinalPlayersStanding = () => {
    return(
      <Flexbox flexDirection='column' justifyContent='space-around'>
        <Flexbox flexGrow={ 1 } justifyContent='center'> <font size={ 5 } color={ colors.DARK_BLUE }> <u> Players </u> </font> </Flexbox>
        { this.state.finalPlayers.map((entry, index) => (
          <Flexbox key={ index }>
            { this.renderPoliticalCapitalValue(index, entry.name, entry.politicalCapital) }
          </Flexbox>
        ))
        }
      </Flexbox>
    )
  }

  renderPartyPlayersTable = (party) => {
    return(
      <Flexbox flexWrap='wrap' style={ { marginLeft: '15px' } }>
        { party.players.map((player, index2) => (
          <Flexbox key={ index2 } alignItems='center' justifyContent='flex-start'>
            <font style={ { marginLeft: '8px' } }> <b> { player } </b> </font>
          </Flexbox>
        ))
        }
      </Flexbox>
    )
  }

  renderFinalPartiesStanding = () => {
    return(
      <Flexbox flexGrow={ 1 } flexDirection='column' justifyContent='space-around' style={ { marginTop: '15px' } }>
        <Flexbox flexGrow={ 1 } justifyContent='center'> <font size={ 5 } color={ colors.DARK_BLUE }> <u> Parties </u> </font> </Flexbox>
        <Flexbox flexGrow={ 1 } flexDirection='column'>
          { this.state.finalParties.map((entry, index) => (
            <Flexbox flexDirection='column' flexGrow={ 1 } key={ index } >
              <Flexbox flexGrow={ 1 } justifyContent='flex-start' alignItems='center'>
                { this.renderPoliticalCapitalValue(index, entry.partyName, entry.totalPoliticalCapital) }
              </Flexbox>
              { this.renderPartyPlayersTable(entry) }
            </Flexbox>
          ))
          }
        </Flexbox>
      </Flexbox>
    )
  }

  renderDisplayResults = () => {
    return(
      <Flexbox flexGrow={ 1 } flexDirection='column' key='End Game'>
        { this.state.isOverviewScreen && this.renderAdditionalOverviewScreenComponent() }
        <Flexbox flexGrow={ 1 } flexDirection='column' justifyContent='space-around'>
          { this.renderFinalPlayersStanding() }
          { this.renderFinalPartiesStanding() }
        </Flexbox>
      </Flexbox>
    )
  }

  render() {
    return (
      <Flexbox key='End Game' flexGrow={ 1 } flexDirection='column' style={ { marginTop: '10px', width: '90%' } }>
        <ReactCSSTransitionGroup
          transitionName='fade-fast'
          transitionEnterTimeout={ 500 }
          transitionLeaveTimeout={ 500 }
        >
          { this.state.showStatuses ? this.renderLoadingScreen() : this.renderDisplayResults() }
        </ReactCSSTransitionGroup>
      </Flexbox>
    )
  }
}

export default EndGame
