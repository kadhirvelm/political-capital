import React, { Component } from 'react'
import Flexbox from 'flexbox-react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import '../../../styles/Transitions.css'

import RaisedButton from 'material-ui/RaisedButton'

import { colors } from '../../../styles/colors'

import { curry, forEach } from 'ramda'

import { _ } from 'underscore'

const yesNoStyle = (color) => {
  return {
    color: color,
    background: '#FFFFFF',
    borderRadius: '10px',
    margin: '10px',
    padding: '15px',
    height: 100,
    width: 65,
    borderWidth: '1px',
    borderColor: colors.LIGHT_GRAY,
    borderStyle: 'solid',
  }
}

class Vote extends Component {
  constructor(props){
    super(props)
    this.state = Object.assign({}, this.propsConst(props), {
      votes: props.players && this.updateVotes(props),
      disableVote: process.env.REACT_APP_DEBUG === 'false' ? 10 : 0,
    })
  }

  propsConst = (props) => {
    return({
      dispatch: props.dispatch,
      managingSocket: props.managingSocket,
      players: props.players,
      playerName: props.playerName,
      playerPartyName: props.playerPartyName,
      round: props.round,
      id: props.id,
    })
  }

  componentDidMount(){
    if(process.env.REACT_APP_DEBUG === 'false'){
      this.disableVote()
    }
  }

  disableVote = () => {
    let disableVote = this.state.disableVote
    _.delay(() => {
      this.setState({ disableVote: --disableVote }, () => {
        if(this.state.disableVote > 0){
          this.disableVote()
        }
      })
    }, 1000)
  }

  updateVotes = (props) => {
    const votes = {}
    const playedPartyCard = (props.round && props.round.partyCards[props.playerPartyName])
    const appendIndex = (index) => votes[index] = playedPartyCard ? (playedPartyCard.type === 'no' ? false : playedPartyCard.type === 'yes' ? true : (Math.random() > 0.5 ? true : false)) : true
    forEach(appendIndex, _.range(props.players[props.playerName].senators))
    return votes
  }

  componentWillReceiveProps(nextProps){
    this.setState(this.propsConst(nextProps))
  }

  currentVote = () => {
    const totalVotes = _.countBy(this.state.votes, (vote) => {
      return vote ? 'yes' : 'no'
    })
    return _.defaults(totalVotes, { yes: 0, no: 0 })
  }

  handleVote = () => {
    this.state.managingSocket.emit('vote', this.currentVote())
  }

  handleMouseDown = () => this.setState({ pressed: true })
  handleMouseUp = () => this.setState({ pressed: false })

  changeVote = (index, event) => {
    const currVotes = this.state.votes
    currVotes[index] = !currVotes[index]
    this.setState({ votes: currVotes })
  }

  curryChangeVote = curry(this.changeVote)

  renderHasVotedDisplay = () => {
    return(
      <Flexbox key='Voted' flexDirection='column' alignItems='center'>
        <font size={ 2 }> Submitted: <font color='#27AE60'> { this.state.round.individualVotes[this.state.playerName].yes } Yes </font> and <font color='#E74C3C'> { this.state.round.individualVotes[this.state.playerName].no } No </font>. </font>
      </Flexbox>
    )
  }

  renderIsVotingDisplay = () => {
    return(
      <Flexbox key='Voting' flexDirection='column' flexGrow={ 1 } alignItems='center'>
        <RaisedButton fullWidth={ true } label={ (this.state.disableVote > 0) ? this.state.disableVote : ('Vote ' + this.currentVote().yes + ' yes and ' + this.currentVote().no + ' no') } disabled={ this.state.disableVote > 0 } primary={ true } onTouchTap={ this.handleVote } buttonStyle={ { borderRadius: '15px' } } style={ { borderRadius: '15px' } } />
        <Flexbox justifyContent='center' flexWrap='wrap'>
          { _.values(this.state.votes).map((entry, index) => (
            <Flexbox style={ entry ? yesNoStyle(colors.GREEN) : yesNoStyle(colors.RED) } key={ index } justifyContent='center' alignItems='center' onTouchTap={ this.curryChangeVote(index) }>
              <font size={ 15 }> { entry ? 'Yes' : 'No' } </font>
            </Flexbox>
          ))
          }
        </Flexbox>
      </Flexbox>
    )
  }

  renderVoteDisplay = () => {
    return(
      <ReactCSSTransitionGroup
        transitionName='fade-fast'
        transitionEnterTimeout={ 500 }
        transitionLeaveTimeout={ 500 }
      >
        { _.contains(_.keys(this.state.round.individualVotes), this.state.playerName.toString()) ? this.renderHasVotedDisplay() : this.renderIsVotingDisplay() }
      </ReactCSSTransitionGroup>
    )
  }

  render() {
    return (
      <Flexbox id={ this.state.id } flexDirection='column' alignItems='center' flexGrow={ 1 } style={ { marginTop: '10px', width: '90%' } }>
        <Flexbox flexDirection='column' alignItems='center' style={ { marginBottom: '10px' } }>
          <font size={ 4 }> Collecting Votes ({ _.keys(this.state.round.individualVotes).length } / { _.keys(this.state.players).length }) </font>
        </Flexbox>
        { this.renderVoteDisplay() }
      </Flexbox>
    )
  }
}

export default Vote
