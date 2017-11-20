import React, { Component } from 'react'
import Flexbox from 'flexbox-react'

import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'

import { colors } from '../styles/colors'

import { _ } from 'underscore'

class DisplayVotes extends Component {
  constructor(props){
    super(props)
    this.state = this.propsConst(props)
  }

  propsConst = (props) => {
    return({
      round: props.round,
      previousRound: props.previousRound || props.round,
      limit: props.limit,
    })
  }

  componentWillReceiveProps(nextProps){
    this.setState(this.propsConst(nextProps))
  }

  returnIndividualPlayers = () => {
    const singlePlayer = (votes, playerName) => {
      return (
        <TableRow key={ playerName }>
          <TableRowColumn style={ { wordWrap: 'break-word', whiteSpace: 'normal' } }> { playerName } </TableRowColumn>
          <TableRowColumn style={ { wordWrap: 'break-word', whiteSpace: 'normal' } }> { votes.yes } </TableRowColumn>
          <TableRowColumn style={ { wordWrap: 'break-word', whiteSpace: 'normal' } }> { votes.no } </TableRowColumn>
        </TableRow>
      )
    }
    return _.map(this.state.previousRound.individualVotes, singlePlayer)
  }

  returnWinner = () => {
    return this.state.previousRound.totalVotes.yes > this.state.previousRound.totalVotes.no ? <font color={ colors.GREEN }> Passed </font> : <font color={ colors.RED }> Failed </font>
  }

  render() {
    return (
      <Flexbox flexDirection='column'>
        { !this.state.limit &&
          <Flexbox flexDirection='column' alignItems='center'>
            <font> { this.returnWinner() } (<font size={ 2 }> Yes: { this.state.previousRound.totalVotes.yes } &nbsp; No: { this.state.previousRound.totalVotes.no } </font>) </font>
          </Flexbox>
        }
        <Flexbox flexDirection='column' style={ { borderStyle: 'solid', borderColor: 'grey', borderWidth: '0.5px', padding: '7px', background: '#FFFFFF' } }>
          <Table selectable={ false } fixedHeader={ true } style={ { tableLayout: 'auto' } }>
            <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
              <TableRow>
                <TableHeaderColumn> Name </TableHeaderColumn>
                <TableHeaderColumn> Yes </TableHeaderColumn>
                <TableHeaderColumn> No </TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={ false }>
              { this.returnIndividualPlayers() }
            </TableBody>
          </Table>
        </Flexbox>
      </Flexbox>
    )
  }
}

export default DisplayVotes
