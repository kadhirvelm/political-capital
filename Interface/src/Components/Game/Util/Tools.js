import React, { Component } from 'react'
import Flexbox from 'flexbox-react'
import { Link } from 'react-router-dom'

import Dialog from 'material-ui/Dialog'
import RaisedButton from 'material-ui/RaisedButton'
import IconButton from 'material-ui/IconButton'
import TextField from 'material-ui/TextField'
import Drawer from 'material-ui/Drawer'
import MenuItem from 'material-ui/MenuItem'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'
import Divider from 'material-ui/Divider'
import Subheader from 'material-ui/Subheader'

import { listOfPlayers } from './util.js'
import { colors, allColorHexes } from '../../../styles/colors'
import { _ } from 'underscore'
import { curry, map, sum, sortWith, descend } from 'ramda'
import { svgIcon } from '../../../Images/icons'

class Tools extends Component {
  constructor(props){
    super(props)
    this.state = Object.assign({}, this.propsConst(props), {
      openDialog: false,
      confirmed: false,
      openTryingToDisconnect: props.openTryingToDisconnect,
    })
    this.allColorHexes = allColorHexes
  }

  propsConst(props){
    return({
      managingSocket: props.managingSocket,
      connectedRoom: props.connectedRoom,
      rounds: props.rounds,
      currentRound: props.currentRound,
      parties: props.parties,
      players: props.players,
      playerName: props.playerName,
      playerParty: props.playerParty,
      playerPartyName: props.playerPartyName,
    })
  }

  componentWillReceiveProps(nextProps){
    this.setState(this.propsConst(nextProps))
  }

  handlePlayerSelection = (event, index, value) => {
    this.setState({ selectedPlayer: value })
  }

  hasPoliticalCapital = () => {
    return (this.state.amount || 0) <= this.state.players[this.state.playerName].politicalCapital * 0.5
  }

  handleTransferPoliticalCapital = () => {
    this.state.managingSocket.emit('transferToPlayer', this.state.amount, this.state.selectedPlayer)
    this.setState({ openDialog: false, confirmed: false, amount: '', selectedPlayer: {} })
  }

  changeAmount = (event) => {
    this.setState({ amount: parseInt(event.target.value, 10) || '' })
  }

  changeDrawer = (open) => this.setState({ openTools: open })
  openDrawer = () => this.changeDrawer(!this.state.openTools)

  closeDialog = () => this.setState({ openDialog: false })
  openDialog = (title, event) => this.setState({ changeDrawer: false, openDialog: true, title: title })
  curryOpenDialog = curry(this.openDialog)
  changeConfirmed = () => this.setState({ confirmed: !this.state.confirmed })
  totalPartyAverageWorth = (party) => sum(_.map(party.players, (player) => this.state.rounds[this.state.currentRound].currentRoundStats[player].politicalCapital)) / party.players.length
  sortParties = sortWith([ descend(this.totalPartyAverageWorth) ])

  returnIndividualPlayers = (allParties) => {
    const allPartyEntries = this.sortParties(_.values(allParties))

    const singlePlayer = (party, playerName) => {
      return (
        <TableRow>
          <TableRowColumn style={ { wordWrap: 'break-word', whiteSpace: 'normal' } }> <font style={ { borderBottomStyle: 'solid', borderBottomColor: this.allColorHexes[this.state.players[playerName].party - 1], borderBottomWidth: '2px', marginBottom: '2px' } }> { playerName } </font> </TableRowColumn>
          <TableRowColumn style={ { wordWrap: 'break-word', whiteSpace: 'normal' } }> <font style={ { borderBottomStyle: 'solid', borderBottomColor: this.allColorHexes[this.state.players[playerName].party - 1], borderBottomWidth: '2px', marginBottom: '2px' } }> { this.state.rounds[this.state.currentRound].currentRoundStats[playerName].politicalCapital }, { this.state.rounds[this.state.currentRound].currentRoundStats[playerName].senators }</font> </TableRowColumn>
        </TableRow>
      )
    }
    const currySinglePlayer = curry(singlePlayer)

    return map((entry) => map(currySinglePlayer(entry.partyName), entry.players), allPartyEntries)
  }

  openTryingToDisconnect = () => {
    this.state.openTryingToDisconnect()
  }

  partyColor = (partyName) => {
    return _.findKey(this.state.parties, (party) => party.partyName === partyName)
  }

  roundStats = (round, playerKey, playerItem) => {
    return (this.state.rounds && this.state.rounds[round]) && this.state.rounds[round].currentRoundStats[playerKey][playerItem]
  }

  styleDelta = (newValue) => {
    const color = newValue === 0 ? colors.ORANGE : (newValue > 0 ? colors.GREEN : colors.RED)
    return(
      <Flexbox alignItems='center'>
        <font color={ color } style={ { marginRight: '10px' } }> { newValue } </font>
        <div> { color === colors.GREEN && svgIcon('circle_up', color) } </div>
        <div> { color === colors.RED && svgIcon('circle_down', color) } </div>
      </Flexbox>
    )
  }

  mapPlayersByCapital = () => {
    const currentRoundStats = _.values(_.mapObject(this.state.rounds[this.state.currentRound].currentRoundStats, (value, key) => _.extend(value, { name: key })))
    return sortWith([ descend(_.property('politicalCapital')) ])(currentRoundStats)
  }

  renderPartyNameInPartyBreakdown = (party) => <TableRowColumn style={ { wordWrap: 'break-word', whiteSpace: 'normal' } }> <font style={ { borderBottomStyle: 'solid', borderBottomColor: this.allColorHexes[party.partyName - 1], borderBottomWidth: '2px', marginBottom: '2px' } }> { party.partyName } </font> </TableRowColumn>

  renderBribe = () => {
    return (
      <Flexbox flexDirection='column'>
        <Flexbox flexDirection='column'>
          <Flexbox> <font> Can send at most <font color={ colors.RED }> <b> { Math.floor(this.state.players[this.state.playerName].politicalCapital * 0.5) } </b> </font> capital </font> </Flexbox>
          <Flexbox justifyContent='center' style={ { marginTop: '10px' } }>
            <div style={ { marginRight: '10px' } }> { svgIcon('coinDollar') } { this.state.players[this.state.playerName].politicalCapital } </div>
            <div> { svgIcon('senator') } { this.state.players[this.state.playerName].senators } </div>
          </Flexbox>
        </Flexbox>
        <Flexbox>
          { listOfPlayers(this.state, this.handlePlayerSelection) }
          <TextField style={ { width: '75px', marginLeft: '10px' } } value={ this.state.amount || '' } floatingLabelText='Amount' onChange={ this.changeAmount } errorText={ !this.hasPoliticalCapital() ? 'To High' : '' } />
        </Flexbox>
        <RaisedButton label={ this.state.confirmed ? 'Confirm' : 'Transfer' } primary={ this.state.confirmed } onTouchTap={ this.state.confirmed ? this.handleTransferPoliticalCapital : this.changeConfirmed } disabled={ !this.hasPoliticalCapital() } />
      </Flexbox>
    )
  }

  renderPlayerHistoryTable = () => {
    return(
      <Table height={ (window.innerHeight * 0.25) + 'px' } style={ { width: '100%' } } selectable={ false } fixedHeader={ true }>
        <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
          <TableRow>
            <TableHeaderColumn> Player </TableHeaderColumn>
            <TableHeaderColumn> { svgIcon('coinDollar') } </TableHeaderColumn>
            <TableHeaderColumn> { svgIcon('senator') } </TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={ false }>
          { this.mapPlayersByCapital().map((player, index) => (
            <TableRow key={ index }>
              <TableRowColumn style={ { wordWrap: 'break-word', whiteSpace: 'normal' } }> <font style={ { borderBottomStyle: 'solid', borderBottomColor: this.allColorHexes[player.party - 1], borderBottomWidth: '2px', marginBottom: '2px' } }> { player.name } </font> </TableRowColumn>
              <TableRowColumn>{ this.styleDelta(this.roundStats(this.state.currentRound, player.name, 'politicalCapital') - this.roundStats(this.state.currentRound - 1, player.name, 'politicalCapital')) } </TableRowColumn>
              <TableRowColumn>{ this.styleDelta(this.roundStats(this.state.currentRound, player.name, 'senators') - this.roundStats(this.state.currentRound - 1, player.name, 'senators')) }</TableRowColumn>
            </TableRow>
          ))
          }
        </TableBody>
      </Table>
    )
  }

  renderRoundHistory = () => {
    return (
      <Flexbox flexGrow={ 1 } style={ { width: Math.max(240, window.innerWidth * 0.65) + 'px' } }>
        { this.state.currentRound > 1 ?
          <Flexbox flexDirection='column' flexGrow={ 1 }>
            <font> Since previous round </font>
            { this.renderPlayerHistoryTable() }
          </Flexbox>
          :
          <font> No history to show </font>
        }
      </Flexbox>
    )
  }

  renderCurrentStandings = () => {
    return(
      <Flexbox justifyContent='center' flexGrow={ 1 }>
        <Flexbox flexDirection='column'>
          <Flexbox flexDirection='column' style={ { borderStyle: 'solid', borderColor: 'grey', borderWidth: '0.5px', padding: '7px', background: '#FFFFFF' } }>
            <Table height={ (window.innerHeight * 0.25) + 'px' } selectable={ false } fixedHeader={ true }>
              <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
                <TableRow>
                  <TableHeaderColumn> Name </TableHeaderColumn>
                  <TableHeaderColumn> { svgIcon('coinDollar') }, { svgIcon('senator') } </TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody displayRowCheckbox={ false }>
                { this.returnIndividualPlayers(this.state.parties) }
              </TableBody>
            </Table>
          </Flexbox>
        </Flexbox>
      </Flexbox>
    )
  }

  renderPartyBreakdown = () => {
    return(
      <Flexbox flexGrow={ 1 } justifyContent='flex-start' style={ { width: Math.max(240, window.innerWidth * 0.65) + 'px' } }>
        <Table height={ (window.innerHeight * 0.25) + 'px' } style={ { width: '100%' } } selectable={ false } fixedHeader={ true }>
          <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
            <TableRow>
              <TableHeaderColumn> Party </TableHeaderColumn>
              <TableHeaderColumn> { svgIcon('coinDollar') } </TableHeaderColumn>
              <TableHeaderColumn> Players </TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={ false }>
            { this.sortParties(_.values(this.state.parties)).map((party, index) => (
              <TableRow key={ index }>
                { this.renderPartyNameInPartyBreakdown(party) }
                <TableRowColumn> { this.totalPartyAverageWorth(party) } </TableRowColumn>
                <TableRowColumn style={ { wordWrap: 'break-word', whiteSpace: 'normal' } }> { this.state.parties[this.partyColor(party.partyName)].players.toString() } </TableRowColumn>
              </TableRow>
            ))
            }
          </TableBody>
        </Table>
      </Flexbox>
    )
  }

  renderLinkToOveriew = () => {
    return(
      <Flexbox justifyContent='center'>
        <Link to={ '/overview/' + this.state.connectedRoom.roomName } target='blank' style={ { textDecoration: 'none', color: colors.LIGHT_BLUE } }> Game Overview </Link>
      </Flexbox>
    )
  }

  renderDisconnectButton = () => {
    return(
      <Flexbox justifyContent='center'>
        <RaisedButton label='Disconnect' secondary={ true } onTouchTap={ this.openTryingToDisconnect } />
      </Flexbox>
    )
  }

  getSelectedOption = () => {
    switch(this.state.title) {
      case 'Bribe':
        return this.renderBribe()
      case 'Round History':
        return this.renderRoundHistory()
      case 'Current Standings':
        return this.renderCurrentStandings()
      case 'Party Breakdown':
        return this.renderPartyBreakdown()
      case 'Game Overview':
        return this.renderLinkToOveriew()
      case 'Disconnect':
        return this.renderDisconnectButton()
      default:
        return (<div> Under Construction </div>)
    }
  }

  renderDrawerWithMenuOptions = () => {
    return(
      <Drawer docked={ false } width='50%' openSecondary={ false } open={ this.state.openTools } onRequestChange={ this.changeDrawer } style={ { zIndex: 2 } } containerStyle={ { zIndex: 2 } } overlayStyle={ { zIndex: 2 } }>
        { this.state.currentRound ?
          <div>
            <Subheader> Actions </Subheader>
            <MenuItem onTouchTap={ this.curryOpenDialog('Bribe') }> Bribe </MenuItem>
            { /* <MenuItem onTouchTap={ this.curryOpenDialog('Investigate') }> Investigate </MenuItem> */ }
            <Divider />
            <Subheader> Information </Subheader>
            <MenuItem onTouchTap={ this.curryOpenDialog('Round History') }> Round History </MenuItem>
            <MenuItem onTouchTap={ this.curryOpenDialog('Current Standings') }> Current Standings </MenuItem>
            <MenuItem onTouchTap={ this.curryOpenDialog('Party Breakdown') }> Party Breakdown </MenuItem>
            <Divider />
          </div>
          :
          <div />
        }
        <Subheader> Logistics </Subheader>
        <MenuItem onTouchTap={ this.curryOpenDialog('Game Overview') }> Game Overview </MenuItem>
        <MenuItem onTouchTap={ this.curryOpenDialog('Disconnect') }> Disconnect </MenuItem>
      </Drawer>
    )
  }

  renderGlobalDialog = () => {
    return(
      <Dialog open={ this.state.openDialog } title={ this.state.title || '' } onRequestClose={ this.closeDialog }
        autoDetectWindowHeight={ false } autoScrollBodyContent={ true } style={ { zIndex: 3 } } contentStyle={ { zIndex: 3 } } overlayStyle={ { zIndex: 2 } }>
        <div> { this.getSelectedOption() } </div>
      </Dialog>
    )
  }

  render() {
    return (
      <Flexbox flexDirection='column'>
        <IconButton onTouchTap={ this.openDrawer } tooltip='Tools'>
          { svgIcon('menu') }
        </IconButton>
        { this.renderDrawerWithMenuOptions() }
        { this.renderGlobalDialog() }
      </Flexbox>
    )
  }
}

export default Tools
