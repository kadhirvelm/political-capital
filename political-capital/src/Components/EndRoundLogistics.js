import React, { Component } from 'react'
import Flexbox from 'flexbox-react'

import RaisedButton from 'material-ui/RaisedButton'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import DisplayVotes from './DisplayVotes'

import { svgIcon } from '../Images/icons'
import { colors, allColorHexes } from '../styles/colors'

import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'

import { _ } from 'underscore'
import { map, curry, sum, sortWith, ascend } from 'ramda'

class EndRoundLogistics extends Component {
  constructor(props){
    super(props)
    this.state = {
      displayFinalTally: false,
      showCalculations: false,
      showVotes: false,
    }
  }

  propsConst = (props) => {
    return({
      dispatch: props.dispatch,
      managingSocket: props.managingSocket,
      currentRound: props.currentRound,
      parties: props.parties,
      playerName: props.playerName,
      changeCurrentlyViewingResults: props.changeCurrentlyViewingResults,
      rounds: props.rounds,
      round: props.rounds[props.currentRound],
      players: props.players,
    })
  }

  componentWillMount(){
    this.setState(this.propsConst(this.props), () => {
      this.state.changeCurrentlyViewingResults()
    })
  }

  componentWillReceiveProps(nextProps){
    this.setState({ players: nextProps.players, round: nextProps.rounds[this.state.currentRound], futureRound: nextProps.currentRound })
  }

  renderType = (type) => {
    if(type === 'yes'){
      return <font color={ colors.GREEN }> Yes </font>
    } else if (type === 'no') {
      return <font color={ colors.RED }> No </font>
    }
    return <font color={ colors.ORANGE }> Neutral </font>
  }

  returnWinner = () => {
    return this.state.round.roundWinner === 'yes' ? <font color={ colors.GREEN }> Passes </font> : <font color={ colors.RED }> Fails </font>
  }

  hasTypeOfCard = (type) => {
    return (!this.state.futureRound || this.state.futureRound === this.state.currentRound) && _.contains(_.values(this.state.round.handleThesePartyCards), type)
  }

  showFinalTally = () => {
    this.setState({ displayFinalTally: true })
  }

  handleFinish = () => {
    this.state.changeCurrentlyViewingResults()
  }

  handlePlayerSelection = (event, index, value) => {
    this.setState({ selectedPlayer: value })
    this.state.managingSocket.emit('recordAction', { selectedPlayer: value, card: this.playerPlayedCard(), confirmed: false })
  }

  listOfPlayers = () => {
    return(
      <SelectField value={ this.state.selectedPlayer } floatingLabelText='Select Player' onChange={ this.handlePlayerSelection }>
        { _.filter(_.values(this.state.players), (player) => player.name !== this.state.playerName).map((player) => (
          <MenuItem key={ player.name } value={ player.name } primaryText={ player.name } />
          ))
        }
      </SelectField>
    )
  }

  playerPlayedCard = () => {
    return this.state.round.handleThesePartyCards[this.state.playerName]
  }

  hasPlayerNullifyCard = () => {
    return this.playerPlayedCard() === 'Nullify'
  }

  hasPlayerStealTakeCard = () => {
    return this.playerPlayedCard() === 'Steal' || this.playerPlayedCard() === 'Take'
  }

  handlePlayerPartyCard = () => {
    if(this.state.selectedPlayer){
      this.state.managingSocket.emit(this.playerPlayedCard(), this.state.selectedPlayer)
      this.state.managingSocket.emit('recordAction', { selectedPlayer: this.state.selectedPlayer, card: this.playerPlayedCard(), confirmed: true })
    }
  }

  /**
  <Flexbox flexGrow={ 1 } flexDirection='column' justifyContent='space-around' style={ { borderStyle: 'solid', borderColor: 'grey', borderWidth: '0.5px', padding: '7px', overflowY: 'scroll', height: '50px' } }>
   { _.keys(this.state.round.partyCards).map( (entry, index) => (
    <Flexbox alignItems='center' key={ index } style={ { marginBottom: '15px', marginTop: '15px' } }>
      <Flexbox style={ partyCardShowStyle }> { entry } ({ _.first(_.filter(_.values(this.state.parties), (party) => party.partyName === entry)).players.toString() }) </Flexbox>
      <Flexbox flexGrow={ 1 } justifyContent='flex-end'> { this.renderType(this.state.round.partyCards[entry].type) }, { this.state.round.partyCards[entry].value } </Flexbox>
    </Flexbox>
    ))
   }
  </Flexbox> */

  showPlayerOptions = () => {
    return(
      <Flexbox flexGrow={ 1 } flexDirection='column' justifyContent='center' alignItems='center' style={ { marginTop: '10px' } }>
        <Flexbox style={ { marginBottom: '-10px' } }>
          <font size={ 4 }> <b> You have to { this.playerPlayedCard() }! </b> </font>
        </Flexbox>
        <Flexbox flexGrow={ 1 } flexDirection='column' alignItems='center'>
          { this.listOfPlayers() }
          <RaisedButton fullWidth={ true } primary={ true } label={ this.playerPlayedCard() } onTouchTap={ this.handlePlayerPartyCard } disabled={ _.isUndefined(this.state.selectedPlayer) } />
        </Flexbox>
      </Flexbox>
    )
  }

  renderPartyCardHandler = () => {
    if(this.hasTypeOfCard('Nullify')){
      return(
        <Flexbox>
          { this.hasPlayerNullifyCard(this.handleSteal) ?
            <div> { this.showPlayerOptions() } </div>
            :
            <div> Waiting for players to nullify </div>
          }
        </Flexbox>
      )
    } else if (!this.hasTypeOfCard('Nullify') && (this.hasTypeOfCard('Steal') || this.hasTypeOfCard('Take'))) {
      return (
        <Flexbox flexGrow={ 1 } justifyContent='center'>
          { this.hasPlayerStealTakeCard() ?
            <div> { this.showPlayerOptions() } </div>
            :
            <div style={ { marginTop: '10px' } }> Waiting for players to steal. </div>
          }
        </Flexbox>
      )
    }
    return (
      <Flexbox flexGrow={ 1 } justifyContent='flex-end'>
        <RaisedButton label='Final Tally' primary={ true } onTouchTap={ this.showFinalTally } style={ { marginTop: '10px' } } />
     </Flexbox>
    )
  }

  renderEffective = (partyCard) => {
    if(partyCard.type === this.state.round.roundWinner || partyCard.type === 'neutral'){
      return svgIcon('checkmark', colors.MEDIUM_BLUE)
    }
    return svgIcon('cancel', colors.LIGHT_GRAY)
  }

  handleDisplayingVotes = () => {
    this.setState({ showVotes: !this.state.showVotes })
  }

  displayPartyCardResolution = () => {
    return(
      <Flexbox flexDirection='column' flexBasis='auto'>
        <Flexbox flexDirection='column' alignItems='center' style={ { marginBottom: '15px' } }>
          <font size={ 6 }> <b> { this.returnWinner() } </b> </font>
          <font size={ 2 }> Yes: { this.state.round.totalVotes.yes }, No: { this.state.round.totalVotes.no } </font>
        </Flexbox>
        <Flexbox flexGrow={ 1 } justifyContent='center' style={ { marginBottom: '15px' } }>
          { this.renderPartyCardHandler() }
        </Flexbox>
        <Flexbox flexDirection='column' style={ { marginBottom: '15px' } }>
          <RaisedButton label={ this.state.showVotes ? 'Hide Votes' : 'Display Votes' } backgroundColor={ this.state.showVotes ? colors.RED : colors.LIGHT_GRAY } onTouchTap={ this.handleDisplayingVotes } />
          { this.state.showVotes && <DisplayVotes limit={ true } round={ this.state.rounds[this.state.currentRound] } /> }
        </Flexbox>
        <Table selectable={ false } style={ { borderColor: colors.LIGHT_GRAY, borderStyle: 'solid', borderWidth: '1px' } }>
          <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
            <TableRow>
              <TableHeaderColumn> Party </TableHeaderColumn>
              <TableHeaderColumn> Party Card </TableHeaderColumn>
              <TableHeaderColumn> Effective </TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={ false }>
            { _.keys(this.state.round.partyCards).map((entry, index) => (
              <TableRow key={ index }>
                <TableRowColumn style={ { wordWrap: 'break-word', whiteSpace: 'normal' } }> { entry } </TableRowColumn>
                <TableRowColumn style={ { wordWrap: 'break-word', whiteSpace: 'normal' } }> { this.renderType(this.state.round.partyCards[entry].type) }, { this.state.round.partyCards[entry].value } </TableRowColumn>
                <TableRowColumn style={ { wordWrap: 'break-word', whiteSpace: 'normal' } }> { this.renderEffective(this.state.round.partyCards[entry]) } </TableRowColumn>
              </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </Flexbox>
    )
  }

  totalPartyAverageWorth = (party) => sum(_.map(party.players, (player) => this.state.rounds[this.state.currentRound].currentRoundStats[player].politicalCapital)) / party.players.length
  sortParties = sortWith([ ascend(this.totalPartyAverageWorth) ])

  returnIndividualPlayers = (allParties) => {
    const allPartyEntries = this.sortParties(_.values(allParties))

    const singlePlayer = (party, playerName) => {
      return (
        <TableRow>
          <TableRowColumn style={ { wordWrap: 'break-word', whiteSpace: 'normal' } }> { playerName } </TableRowColumn>
          <TableRowColumn style={ { wordWrap: 'break-word', whiteSpace: 'normal' } }> { this.state.players[playerName].senators } </TableRowColumn>
          <TableRowColumn style={ { wordWrap: 'break-word', whiteSpace: 'normal' } }> { this.state.players[playerName].politicalCapital } </TableRowColumn>
          <TableRowColumn style={ { wordWrap: 'break-word', whiteSpace: 'normal' } }> <font color={ allColorHexes[this.state.players[playerName].party - 1] }> { party } </font> </TableRowColumn>
        </TableRow>
      )
    }
    const currySinglePlayer = curry(singlePlayer)

    return map((entry) => map(currySinglePlayer(entry.partyName), entry.players), allPartyEntries)
  }

  showCalculations = () => {
    this.setState({ showCalculations: !this.state.showCalculations })
  }

  color = (amount) => {
    return (amount === 0 ? colors.ORANGE : (amount > 0 ? colors.GREEN : colors.RED))
  }
  icon = (amount) => {
    return (amount === 0 ? '' : (amount > 0 ? svgIcon('circle_up', this.color(amount)) : svgIcon('circle_down', this.color(amount))))
  }

  renderIndividualCategory = (title, amount) => {
    return(
      <Flexbox flexDirection='column' alignItems='center'>
        <font style={ { marginBottom: '5px' } }> <i> { title } </i> </font>
        <Flexbox alignItems='center'> <font color={ title === 'Taxed' ? colors.DARK_GRAY : this.color(amount) }> { amount } </font> <div style={ { marginLeft: '5px' } }> { (title !== 'Taxed') && this.icon(amount) } </div> </Flexbox>
      </Flexbox>
    )
  }

  changeAmount = (key) => this.state.players[this.state.playerName][key] - this.state.rounds[this.state.currentRound].currentRoundStats[this.state.playerName][key]

  renderTitle = (title, key) => {
    const changeAmount = this.changeAmount(key)
    return(
      <Flexbox alignItems='center'> <u> { title } </u> <font style={ { marginLeft: '5px', marginRight: '5px' } } color={ this.color(changeAmount) }> ({ changeAmount }) </font> { this.icon(changeAmount) } </Flexbox>
    )
  }

  displayFinalTally = () => {
    const playerLogic = this.state.round.changeLogic[this.state.playerName]
    return(
      <Flexbox flexDirection='column'>
        <Flexbox flexGrow={ 1 } justifyContent='flex-end' style={ { marginTop: '15px', marginBottom: '15px' } }>
          <RaisedButton primary={ true } label='Next Round' onTouchTap={ this.handleFinish } />
        </Flexbox>
        <Flexbox flexDirection='column' flexGrow={ 1 } style={ this.state.showCalculations ? { marginBottom: '15px', borderStyle: 'solid', borderRadius: '10px', borderColor: colors.DARKER_PASTEL, borderWidth: '0.5px', padding: '7px', background: colors.SLIGHTLY_DARKER_PASTEL } : { marginBottom: '15px' } }>
          <Flexbox flexGrow={ 1 } justifyContent='flex-start'>
            <RaisedButton label={ (this.state.showCalculations ? 'Close' : 'Show') + ' Calculations' } secondary={ this.state.showCalculations } onTouchTap={ this.showCalculations } />
            <Flexbox flexGrow={ 1 } justifyContent='space-around'>
              <Flexbox alignItems='center'> { svgIcon('coinDollar', this.color(this.changeAmount('politicalCapital'))) } <font color={ this.color(this.changeAmount('politicalCapital')) } style={ { marginLeft: '10px' } }> { this.state.players[this.state.playerName].politicalCapital } </font> </Flexbox>
              <Flexbox alignItems='center'> { svgIcon('senator', this.color(this.changeAmount('senators'))) } <font color={ this.color(this.changeAmount('senators')) } style={ { marginLeft: '10px' } }> { this.state.players[this.state.playerName].senators } </font> </Flexbox>
            </Flexbox>
          </Flexbox>
          { (this.state.showCalculations && playerLogic) &&
            <Flexbox flexDirection='column'>
              <Flexbox flexDirection='column' flexGrow={ 1 } style={ { marginTop: '10px', marginBottom: '10px' } }>
                <Flexbox flexGrow={ 1 } justifyContent='flex-start' style={ { marginBottom: '10px' } }> { this.renderTitle('Political Capital', 'politicalCapital') } </Flexbox>
                <Flexbox alignItems='baseline' justifyContent='space-around'>
                  <font> Resolution) </font>
                  { this.renderIndividualCategory('No', playerLogic.politicalCapitalNo) }
                  { this.renderIndividualCategory('Yes', playerLogic.politicalCapitalYes) }
                  { this.renderIndividualCategory('Party Card', playerLogic.politicalCapitalOther) }
                </Flexbox>
                <Flexbox alignItems='baseline' justifyContent='space-around' style={ { marginTop: '10px' } }>
                  <font> Miscellanous) </font>
                  { this.renderIndividualCategory('Steals', playerLogic.steal || 0) }
                  { this.renderIndividualCategory('Chance', playerLogic.chance || 0) }
                  { !_.isUndefined(playerLogic.totalSenatorTax) && this.renderIndividualCategory('Tax', playerLogic.totalSenatorTax) }
                </Flexbox>
              </Flexbox>

              <Flexbox flexDirection='column' flexGrow={ 1 }>
                <Flexbox flexGrow={ 1 } justifyContent='flex-start' style={ { marginBottom: '10px' } }> { this.renderTitle('Senators', 'senators') } </Flexbox>
                <Flexbox alignItems='baseline' justifyContent='space-around'>
                  <font> Resolution) </font>
                  { this.renderIndividualCategory('Voting', playerLogic.senatorResolution) }
                  { this.renderIndividualCategory('Party Card', playerLogic.senatorOther) }
                  { !_.isUndefined(playerLogic.totalSenatorTax) && this.renderIndividualCategory('Taxed', playerLogic.totalSenatorsForTax) }
                </Flexbox>
              </Flexbox>
            </Flexbox>
          }
        </Flexbox>
        <Flexbox flexDirection='column' style={ { borderStyle: 'solid', borderColor: colors.DARK_GRAY, borderRadius: '10px', borderWidth: '0.5px', padding: '7px', background: colors.SLIGHTLY_DARKER_PASTEL } }>
          <Flexbox flexGrow={ 1 } justifyContent='flex-start'> <font size={ 2 }> Current Standings </font> </Flexbox>
          <Table selectable={ false } fixedHeader={ true } style={ { tableLayout: 'auto' } }>
            <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
              <TableRow>
                <TableHeaderColumn> Name </TableHeaderColumn>
                <TableHeaderColumn> Senators </TableHeaderColumn>
                <TableHeaderColumn> Capital </TableHeaderColumn>
                <TableHeaderColumn> Party </TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={ false }>
              { this.returnIndividualPlayers(this.state.parties) }
            </TableBody>
          </Table>
        </Flexbox>
      </Flexbox>
    )
  }

  render() {
    return (
      <Flexbox flexDirection='column' style={ { marginTop: '10px' } }>
        <Flexbox flexDirection='column' alignItems='center' flexGrow={ 1 }>
          <font> Round { this.state.currentRound } </font>
          <font> { (this.state.currentRound % 2 === 0) && 'Senate tax this round!' } </font>
        </Flexbox>
        { this.state.displayFinalTally ?
          this.displayFinalTally()
          :
          this.displayPartyCardResolution()
        }
      </Flexbox>
    )
  }
}

export default EndRoundLogistics