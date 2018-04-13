import React, { Component } from 'react'
import Flexbox from 'flexbox-react'

import { map } from 'ramda'

import { colors } from '../../styles/colors'

class ResolutionAndChance extends Component {
  constructor(props){
    super(props)
    this.state = Object.assign({}, this.propsConst(props), {
      horizontal: props.horizontal || false,
      isOverview: props.isOverview,
    })
  }

  propsConst = (props) => {
    return({
      round: props.round,
      resolution: props.round.resolution,
      chance: props.round.chance,
      currentRound: props.currentRound,
      managingSocket: props.managingSocket,
      gameType: props.gameType,
    })
  }

  componentWillReceiveProps(nextProps){
    this.setState(this.propsConst(nextProps))
  }

  effect = (effect) => {
    switch(effect){
      case 'Get 20':
        return 'Gain 20 political capital'
      case 'Lose 20':
        return 'Lose 20 political capital'
      case 'Lose 10 Senator':
        return 'Lose 10 political capital per senator'
      case '2x Everything':
        return 'Everything is doubled'
      case 'Get 10 Senator':
        return 'Gain 10 political capital per senator'
      case '2x Negatives':
        return 'Double Negatives'
      case '0.5x Everything':
        return 'Halve Everything'
      case 'None':
        return 'None'
      case '2x Positives':
        return 'Double Positives'
      case 'Super Majority Fail':
        return 'Needs super majority to fail'
      case 'Super Majority Pass':
        return 'Needs super majority to pass'
      default:
        return effect
    }
  }

  cardStyle = { backgroundColor: '#FFFFFF', padding: '10px', width: '85%', margin: '10px', borderRadius: '10px', borderColor: '#424949', borderWidth: '1px', borderStyle: 'solid' }
  horizontalCardStyle = Object.assign({}, this.cardStyle, { height: '350px', width: '450px' })
  overviewStyle = { backgroundColor: '#FFFFFF', height: '175px', padding: '10px', margin: '10px', borderRadius: '10px', borderColor: '#424949', borderWidth: '1px', borderStyle: 'solid' }
  cardFlavorStyle = { textAlign: 'justify', marginRight: '10px', marginLeft: '10px' }
  effectStyle = { background: '#353535', width: '80%', padding: '10px', marginTop: '10px', borderRadius: '10px', color: '#F2BD1E' }
  overviewEffectStyle = { background: '#353535', width: '250px', padding: '10px', marginTop: '10px', borderRadius: '10px', color: '#F2BD1E' }
  numberStyle = { marginBottom: '10px' }

  renderResolutionTable = (resolution) => {
    return(
      <Flexbox flexDirection='column' flexGrow={ 1 } style={ this.state.isOverview ? { width: '250px' } : {} }>
        <Flexbox flexGrow={ 1 } justifyContent='space-around'>
          <Flexbox style={ { marginBottom: '5px', width: '33%' } } />
          <Flexbox style={ { marginBottom: '5px' } }> Passes </Flexbox>
          <Flexbox style={ { marginBottom: '5px' } }> Fails </Flexbox>
        </Flexbox>
        <Flexbox flexGrow={ 1 } justifyContent='space-around'>
          <font size={ 3 } style={ { width: '33%' } }> Vote Yes </font>
          <font style={ this.numberStyle } size={ 4 } color={ colors.GREEN }> { resolution.yes.inFavor } </font>
          <font style={ this.numberStyle } size={ 4 } color={ colors.RED }> { resolution.yes.against } </font>
        </Flexbox>
        <Flexbox flexGrow={ 1 } justifyContent='space-around'>
          <font size={ 3 } style={ { width: '33%' } }> Vote No </font>
          <font size={ 4 } color={ colors.RED }> { resolution.no.against } </font>
          <font size={ 4 } color={ colors.GREEN }> { resolution.no.inFavor } </font>
        </Flexbox>
      </Flexbox>
    )
  }

  resolutionTable = (resolution) => {
    return this.renderResolutionTable(resolution)
  }

  renderResolutionTitle = () => <h1> Resolution </h1>

  renderResolution = () => {
    return(
      <Flexbox flexDirection='column' alignItems='center' style={ !this.state.isOverview ? (this.state.horizontal ? this.horizontalCardStyle : this.cardStyle) : this.overviewStyle }>
        { this.renderResolutionTitle() }
        { this.state.resolution &&
          <Flexbox flexDirection='column' flexGrow={ 1 }>
            { this.state.gameType !== 'Tutorial' && <Flexbox style={ this.cardFlavorStyle }> { this.state.resolution.flavorText } </Flexbox> }
            <Flexbox flexGrow={ 1 } justifyContent='center' alignItems='flex-end'>
              { this.state.gameType !== 'Commonwealth' && <Flexbox justifyContent='center' style={ this.effectStyle }> { this.resolutionTable(this.state.resolution) } </Flexbox> }
            </Flexbox>
          </Flexbox>
        }
      </Flexbox>
    )
  }

  renderChance = () => {
    return(
      <Flexbox flexDirection='column' alignItems='center' flexGrow={ 1 } style={ !this.state.isOverview ? (this.state.horizontal ? this.horizontalCardStyle : this.cardStyle) : this.overviewStyle }>
        <h1> Chance </h1>
        { this.state.chance &&
          <Flexbox flexDirection='column' flexGrow={ 1 }>
            { this.state.gameType !== 'Tutorial' && <Flexbox style={ this.cardFlavorStyle }> { this.state.chance.flavorText } </Flexbox> }
            <Flexbox flexGrow={ 1 } justifyContent='center' alignItems='flex-end'>
              <Flexbox alignItems='center' flexDirection='column' style={ this.state.isOverview ? this.overviewEffectStyle : this.effectStyle }>
                { map(this.effect, this.state.chance.effect).map((entry, index) => (
                  <div key={ index }> { entry } </div>
                ))
                }
              </Flexbox>
            </Flexbox>
          </Flexbox>
        }
      </Flexbox>
    )
  }

  renderSenateTaxReminder = () => {
    return(
      <Flexbox flexDirection='column' alignItems='center' style={ { marginTop: '10px' } }>
        { (this.state.currentRound && !this.state.horizontal) &&
          <Flexbox flexDirection='column' alignItems='center'>
            <font> Round { this.state.currentRound } </font>
            <font color={ colors.RED }> { (this.state.currentRound % 2 === 0) && 'Senate tax this round!' } </font>
          </Flexbox>
        }
      </Flexbox>
    )
  }

  render() {
    return (
      <Flexbox flexDirection='column'>
        <Flexbox flexGrow={ 1 } flexDirection={ (this.state.horizontal && !this.state.isOverview) ? 'row' : 'column' } alignItems='center' justifyContent='center'>
          { this.renderResolution() }
          { this.renderChance() }
        </Flexbox>
        { this.renderSenateTaxReminder() }
      </Flexbox>
    )
  }
}

export default ResolutionAndChance
