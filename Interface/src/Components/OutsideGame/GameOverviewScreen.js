import React, { Component } from 'react'
import Flexbox from 'flexbox-react'
import { _ } from 'underscore'
import { colors, allColorHexes } from '../../styles/colors'
import { svgIcon } from '../../Images/icons'

import '../../styles/Transitions.css'

import EndGame from './EndGame'
import ResolutionAndChance from '../Game/ResolutionAndChance'
import DisplayVotes from '../Game/Util/DisplayVotes'

import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'
import Dialog from 'material-ui/Dialog'
import Snackbar from 'material-ui/Snackbar'

// import Sound from 'react-sound'
import { selectedPartyStyle, basePartyStyle } from '../Game/Util/util.js'

import { map, sortWith, descend, ascend } from 'ramda'

const io = require('socket.io-client')

const individualBox = { borderColor: colors.DARKER_PASTEL, borderStyle: 'solid', borderWidth: '1px', padding: '10px', backgroundColor: colors.SLIGHTLY_DARKER_PASTEL }

class GameOverview extends Component {
  constructor(props){
    super(props)
    this.state = {
      roomName: props.match.params.nsp,
      managingSocket: io(process.env.REACT_APP_POLITICAL_CAPITAL + '/' + props.match.params.nsp.replaceAll(' ', '%20'), { autoConnect: true, reconnection: true }),
      rounds: {},
      players: {},
      parties: {},
      currentRound: 0,
      gameClosed: true,
      bribeSentOut: false,
    }
  }

  componentWillMount(){
    if(!this.state.managingSocket){
      this.state.disconnect()
    } else {
      this.state.managingSocket.connect()
      this.handleAllSocketConnections()
    }
  }

  componentDidMount(){
    this.state.managingSocket.emit('getFullGame')
  }

  componentWillUnmount(){
    if(this.state.managingSocket.connected){
      this.state.managingSocket.disconnect()
    }
  }

  /**
   * Socket connection logic
   */

  handleRoundChangingLogic = () => {
    this.state.managingSocket.on('updateCurrentRoundDetails', (rounds) => {
      this.setState(Object.assign({}, this.updateAllRounds(rounds.rounds), this.updateCurrentRound(rounds.currentRound), this.updateCurrActionsAgainstPlayer(rounds.rounds[rounds.currentRound])))
    })

    this.state.managingSocket.on('nextRound', (gameInfo) => {
      this.setState(Object.assign({}, this.updateAllRounds(gameInfo.rounds), this.updateAllPlayers(gameInfo.players), this.updateAllParties(gameInfo.parties), this.updateCurrentRound(gameInfo.currentRound), this.updateCurrActionsAgainstPlayer(gameInfo.rounds[gameInfo.currentRound])), () => {
        this.keepActionsAgainstPlayersOpen(true)
      })
    })

    this.state.managingSocket.on('updateRound', (rounds) => {
      this.setState(Object.assign({}, this.updateAllRounds(rounds), this.updateCurrActionsAgainstPlayer((rounds && this.state.currentRound) && rounds[this.state.currentRound])))
    })
  }

  handleFinalizingActions = () => {
    this.state.managingSocket.on('allPartiesSelectedPartyCard', (gameInfo) => {
      this.setState(Object.assign({}, this.updateAllRounds(gameInfo.rounds), this.updateAllPlayers(gameInfo.players), this.updateAllParties(gameInfo.parties), this.updateCurrentRound(gameInfo.currentRound)))
    })

    this.state.managingSocket.on('allVotingFinalized', (rounds) => {
      this.setState(Object.assign({}, this.updateAllRounds(rounds.rounds), this.updateCurrActionsAgainstPlayer(rounds.rounds[rounds.currentRound])))
    })
  }

  handleActionAgainstPlayer = () => {
    this.state.managingSocket.on('actionsAgainstPlayers', (actions) => {
      let currActions = this.state.actionsAgainstPlayer || {}
      if(!_.isEmpty(currActions)){
        currActions[actions.fromPlayer] = actions
        if(actions.card === 'Nullify' && actions.confirmed){
          currActions = _.omit(currActions, actions.selectedPlayer)
        }
        this.setState({ actionsAgainstPlayer: currActions })
      }
    })
  }

  handleEndingAndClosingGame = () => {
    this.state.managingSocket.on('endGame', (endGame) => {
      this.setState({ endGame: endGame, gameClosed: false })
    })

    this.state.managingSocket.on('closeGame', () => {
      this.setState({ gameClosed: true })
    })
  }

  handleUpdatingPlayersAndParties = () => {
    this.state.managingSocket.on('updatePlayers', (players) => {
      this.setState(this.updateAllPlayers(players))
    })

    this.state.managingSocket.on('allPartyNamesSet', (parties) => {
      this.setState(this.updateAllParties(parties))
    })
  }

  handleReceivingFullGame = () => {
    this.state.managingSocket.on('receiveFullGame', (gameInfo) => {
      if(!_.isEmpty(gameInfo.endGame)){
        this.setState({ endGame: gameInfo.endGame, gameClosed: false })
      } else {
        this.setState(Object.assign({}, this.updateAllRounds(gameInfo.rounds), this.updateAllPlayers(gameInfo.players), this.updateAllParties(gameInfo.parties), this.updateCurrentRound(gameInfo.currentRound), this.updateCurrActionsAgainstPlayer(gameInfo.rounds[gameInfo.currentRound]), { gameClosed: false }))
      }
    })
  }

  handleAllSocketConnections = () => {
    this.state.managingSocket.on('bribeSentOut', (bribeAmount) => {
      this.changePlaySound(true, bribeAmount)
    })

    this.handleReceivingFullGame()
    this.handleUpdatingPlayersAndParties()
    this.handleEndingAndClosingGame()
    this.handleRoundChangingLogic()
    this.handleFinalizingActions()
    this.handleActionAgainstPlayer()
  }

  handleEndGame = (gameInfo) => {
    this.setState({ endGame: gameInfo })
  }

  updateAllRounds = (rounds) => {
    return { rounds: rounds }
  }

  updateAllPlayers = (players) => {
    return { players: players }
  }

  updateAllParties = (parties) => {
    return { parties: parties }
  }

  updateSelectedPartyCard = (selectedPartyCard) => {
    return { selectedPartyCard: selectedPartyCard }
  }

  updateCurrentRound = (currentRoundNumber) => {
    return { currentRound: currentRoundNumber }
  }

  updateCurrActionsAgainstPlayer = (currentRound) => {
    if(!_.isEmpty(currentRound)){
      return { actionsAgainstPlayer: _.isEmpty(this.state.actionsAgainstPlayer) ? (_.isObject(currentRound) && currentRound.actionsAgainstPlayer) : this.state.actionsAgainstPlayer, openActions: !this.state.openActions ? !_.isEmpty(_.isObject(currentRound) && currentRound.actionsAgainstPlayer) : this.state.openActions }
    }
    return {}
  }

  playerPoliticalCapital = (player) => this.state.rounds[this.state.currentRound].currentRoundStats[player.name].politicalCapital
  sortPlayers = sortWith([ descend(this.playerPoliticalCapital) ])
  sortBottomPlayers = sortWith([ ascend(this.playerPoliticalCapital) ])

  returnIndividualPlayers = (isTopPlayers) => {
    const allPlayers = isTopPlayers ? this.sortPlayers(_.values(this.state.players)) : this.sortBottomPlayers(_.values(this.state.players))

    let position = isTopPlayers ? 0 : _.keys(this.state.players).length + 1

    const singlePlayer = (party, playerName) => {
      position = isTopPlayers ? ++position : --position
      return (
        <TableRow key={ playerName }>
          <TableRowColumn style={ { wordWrap: 'break-word', whiteSpace: 'normal' } }> { position } </TableRowColumn>
          <TableRowColumn style={ { wordWrap: 'break-word', whiteSpace: 'normal' } }> { playerName } </TableRowColumn>
          <TableRowColumn style={ { wordWrap: 'break-word', whiteSpace: 'normal' } }> { this.state.rounds[this.state.currentRound].currentRoundStats[playerName].senators } </TableRowColumn>
          <TableRowColumn style={ { wordWrap: 'break-word', whiteSpace: 'normal' } }> { this.state.rounds[this.state.currentRound].currentRoundStats[playerName].politicalCapital } </TableRowColumn>
          <TableRowColumn style={ { wordWrap: 'break-word', whiteSpace: 'normal' } }> { this.state.parties[party].partyName } </TableRowColumn>
        </TableRow>
      )
    }

    return map((player) => singlePlayer(player.party, player.name), allPlayers)
  }

  displayFinalTally = (isTopPlayers) => {
    return(
      <Flexbox flexDirection='column' style={ { marginRight: '5px', marginLeft: '5px' } }>
        <Flexbox flexDirection='column' style={ { borderStyle: 'solid', borderColor: 'grey', borderWidth: '0.5px', padding: '7px', background: '#FFFFFF' } }>
          <Table height='275px' selectable={ false } fixedHeader={ true } style={ { tableLayout: 'auto' } }>
            <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
              <TableRow>
                <TableHeaderColumn> Place </TableHeaderColumn>
                <TableHeaderColumn> Name </TableHeaderColumn>
                <TableHeaderColumn> Senators </TableHeaderColumn>
                <TableHeaderColumn> Capital </TableHeaderColumn>
                <TableHeaderColumn> Party </TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={ false }>
              { this.returnIndividualPlayers(isTopPlayers) }
            </TableBody>
          </Table>
        </Flexbox>
      </Flexbox>
    )
  }

  renderPlayerAction = (fromPlayer, properties) => {
    return(
      <Flexbox flexDirection='column' alignItems='center' justifyContent='space-between' style={ properties.confirmed ? selectedPartyStyle : basePartyStyle }>
        <Flexbox flexDirection='column' alignItems='center'> <font size={ 5 }> { fromPlayer } </font> <font size={ 2 } style={ { marginTop: '10px' } }> &nbsp; will </font> </Flexbox>
        <Flexbox> <font size={ 6 } color={ properties.card === 'Steal' ? colors.MEDIUM_BLUE : colors.ORANGE }> <b> { properties.card } </b> </font> </Flexbox>
        <Flexbox flexBasis='50%' flexDirection='column' alignItems='center'> <font size={ 2 }> from &nbsp; </font> <font size={ 5 } style={ { marginTop: '10px' } }> { properties.selectedPlayer || 'Picking...' } </font> </Flexbox>
      </Flexbox>
    )
  }

  displayPlayerActions = () => {
    return(
      <Flexbox flexWrap='wrap' justifyContent='center'>
        { _.keys(this.state.actionsAgainstPlayer).map((key, index) => (
          <Flexbox key={ index }> { this.renderPlayerAction(key, this.state.actionsAgainstPlayer[key]) } </Flexbox>
        ))
        }
      </Flexbox>
    )
  }

  closeActionsDialog = () => {
    _.delay(() => {
      if(this.state.indicator === 0){
        this.setState({ indicator: '', openActions: false, isClosing: false, actionsAgainstPlayer: undefined })
      } else {
        const newIndicator = (_.isNumber(this.state.indicator) ? this.state.indicator : 8) - 1
        this.setState({ indicator: newIndicator }, () => {
          this.closeActionsDialog()
        })
      }
    }, 700)
  }

  keepActionsAgainstPlayersOpen = (canEnd) => {
    if (this.state.openActions && canEnd && !this.state.isClosing) {
      this.setState({ isClosing: true }, () => {
        this.closeActionsDialog()
      })
    } else if (!_.isEmpty(this.state.actionsAgainstPlayer)){
      this.setState({ openActions: true })
    }
  }

  changePlaySound = (isTrue, bribeAmount) => {
    this.setState({ playSound: isTrue || false })
    if(isTrue){
      this.openBribeSentOut(bribeAmount)
    }
  }

  openBribeSentOut = (bribeAmount) => {
    this.setState({ bribeSentOut: true, bribeAmount: bribeAmount })
  }

  closeBribeSentOut = () => {
    this.setState({ bribeSentOut: false, bribeAmount: '' })
  }

  currentRoundContais = (key, value) => {
    return _.contains(_.keys(this.state.rounds[this.state.currentRound][key]), value)
  }

  currentRoundPartyCardsContainsParty = (party) => {
    return this.currentRoundContais('partyCards', party)
  }

  currentRoundVotesContainsPlayer = (player) => {
    return this.currentRoundContais('individualVotes', player)
  }

  renderPlayersAssemblingList = () => {
    return(
      <Flexbox flexGrow={ 1 } justifyContent='space-around'>
        { _.map(this.state.players, (value, key) => (
          <font key={ key } color={ value.isReady ? allColorHexes[value.party - 1] : colors.DARK_BLUE } style={ { margin: '10px' } }> { value.name } </font>
        ))
        }
      </Flexbox>
    )
  }

  renderPartiesAssembled = () => {
    return(
      <Flexbox flexGrow={ 1 } flexDirection='row' justifyContent='space-around'>
        { _.map(this.state.parties, (value, key) => (
          <Flexbox key={ key + this.currentRoundPartyCardsContainsParty(value.partyName).toString() } flexDirection='column' alignItems='center'>
            <Flexbox alignItems='baseline'>
              <font size={ 5 } color={ allColorHexes[key - 1] }> { value.partyName } </font>
              <div style={ { marginLeft: '7px' } }> { this.currentRoundPartyCardsContainsParty(value.partyName) && svgIcon('smallCheckmark') } </div>
            </Flexbox>
            <Flexbox flexDirection='column' style={ { marginTop: '10px' } }>
              { value.players.map((entry, index) => (
                <Flexbox key={ index + this.currentRoundVotesContainsPlayer(entry).toString() }>
                  <font size={ 3 } key={ index }> { entry } </font>
                  <div style={ { marginLeft: '7px' } }> { this.currentRoundVotesContainsPlayer(entry) && svgIcon('singleCheck') } </div>
                </Flexbox>
              ))
              }
            </Flexbox>
          </Flexbox>
        ))
        }
      </Flexbox>
    )
  }

  renderResolutionAndChance = () => {
    return !_.isEmpty(this.state.rounds) ?
      <Flexbox id='Show rounds here' justifyContent='center' flexGrow={ 1 } style={ Object.assign({}, { marginTop: '15px' }, individualBox) } flexDirection='column'>
        <Flexbox flexShrink={ 1 } justifyContent='flex-start' alignItems='flex-start' style={ { marginTop: '-3px' } }> <font size={ 3 } color={ colors.DARK_GRAY }> Round <b> { this.state.currentRound } </b> </font> </Flexbox>
        <Flexbox flexGrow={ 1 } justifyContent='space-around' alignItems='baseline'>
          <Flexbox alignItems='center' style={ { marginTop: '25px' } }>
            { this.displayFinalTally(true) }
            { _.keys(this.state.players).length > 4 && this.displayFinalTally(false) }
          </Flexbox>
          <Flexbox alignItems='center'>
            { (this.state.rounds && this.state.currentRound && this.state.rounds[this.state.currentRound] && this.state.rounds[this.state.currentRound].resolution) ?
              <ResolutionAndChance isOverview={ true } managingSocket={ this.state.managingSocket } round={ this.state.rounds[this.state.currentRound] } currentRound={ this.state.currentRound } horizontal={ true } />
              :
              <Flexbox />
            }
          </Flexbox>
        </Flexbox>
      </Flexbox>
      :
      <Flexbox />
  }

  renderVotingDisplay = () => {
    return this.state.currentRound > 1 ?
      <Flexbox id='Show votes here' style={ Object.assign({}, individualBox, { marginTop: '15px', background: '#E5E8E8' }) } flexDirection='column'>
        <Flexbox flexShrink={ 1 } justifyContent='flex-start' alignItems='flex-start' style={ { marginTop: '-3px' } }> <font color={ colors.DARK_GRAY }> Previous Round </font> </Flexbox>
        { (this.state.rounds && this.state.currentRound - 1 >= 0 && this.state.rounds[this.state.currentRound - 1]) &&
          <Flexbox flexGrow={ 1 } justifyContent='space-around'>
            <DisplayVotes round={ this.state.rounds[this.state.currentRound] } previousRound={ this.state.rounds[this.state.currentRound - 1] } />
            <ResolutionAndChance isOverview={ true } managingSocket={ this.state.managingSocket } round={ this.state.rounds[this.state.currentRound - 1] } currentRound={ this.state.currentRound - 1 } horizontal={ true } />
          </Flexbox>
        }
      </Flexbox>
      :
      <Flexbox />
  }

  renderOpenActions = () => {
    return this.state.openActions ?
      <Flexbox>
        <Dialog title={ 'Player Actions Round ' + this.state.currentRound } open={ this.state.openActions } modal={ true }>
          <Flexbox flexDirection='column' flexGrow={ 1 }>
            <Flexbox alignItems='center' flexDirection='column' flexGrow={ 1 }>
              { this.displayPlayerActions() }
            </Flexbox>
            <Flexbox flexGrow={ 1 } justifyContent='flex-end'>
              <font> { this.state.indicator < 11 ? this.state.indicator : '' } </font>
            </Flexbox>
          </Flexbox>
        </Dialog>
      </Flexbox>
      :
      <Flexbox />
  }

  renderGameInProgressDisplay = () => {
    return(
      <Flexbox flexGrow={ 1 } flexDirection='column'>
        <Flexbox flexGrow={ 1 } flexDirection='column' alignItems='center'>
          <font size={ 6 }> { this.state.roomName } Overview </font>
        </Flexbox>
        <Flexbox id='Show players and parties' flexDirection='row' justifyContent='center' style={ Object.assign({}, { marginTop: '15px' }, individualBox) }>
          <Flexbox flexShrink={ 1 } justifyContent='flex-start' alignItems='flex-start' style={ { marginTop: '-3px' } }> <font size={ 2 } color={ colors.DARK_GRAY }> Players </font> </Flexbox>
          { this.state.currentRound === 0 ? this.renderPlayersAssemblingList() : this.renderPartiesAssembled() }
        </Flexbox>
        { this.renderResolutionAndChance() }
        { this.renderVotingDisplay() }
        { this.renderOpenActions() }
      </Flexbox>
    )
  }

  renderGameOverviewScreen = () => {
    return (this.state.endGame && this.state.endGame.finalWinners) ? <EndGame dispatch={ this.state.dispatch } endGame={ this.state.endGame } isOverviewScreen={ true } /> : this.renderGameInProgressDisplay()
  }

  render() {
    return (
      <Flexbox flexDirection='column'>
        { this.state.gameClosed ?
          <Flexbox> Either game session has ended or unable to locate game </Flexbox>
          :
          this.renderGameOverviewScreen()
        }
        { /* this.state.playSound && <Sound url='http://sfxcontent.s3.amazonaws.com/soundfx/cash-register.mp3' playStatus={ 'PLAYING' } onFinishedPlaying={ this.changePlaySound } /> -- Error with Safari 11 */ }
        <Snackbar open={ this.state.bribeSentOut } message={'Bribe sent out for ' + this.state.bribeAmount + ' political capital'} autoHideDuration={ 20000 } onRequestClose={ this.closeBribeSentOut } />
      </Flexbox>
    )
  }
}

export default GameOverview
