import React, { Component } from 'react'
import Flexbox from 'flexbox-react'
import '../styles/global.css'

import RaisedButton from 'material-ui/RaisedButton'

const mainButtonStyle = {
  width: '20vw',
  height: '13vh',
  margin: '10px',
  fontSize: '5vmin',
}

const labelStyle = {
  fontSize: '5vmin',
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
    })
  }

  render() {
    return (
      <Flexbox id='Home Screen' flexDirection='column' style={ { top: '40%', left: '50%', transform: 'translate(-50%, -50%)', position: 'absolute' } }>
        <Flexbox flexGrow={ 1 } justifyContent='center'>
          <h1> Welcome to Political Capital </h1>
        </Flexbox>
        <Flexbox flexDirection='row'>
          <RaisedButton label={ (<h2>Learn</h2>) } style={ mainButtonStyle } labelColor='#424949' labelStyle={ labelStyle } />
          <RaisedButton label={ (<h2>Join</h2>) } primary={ true } style={ mainButtonStyle } labelColor='white' labelStyle={ labelStyle } />
          <RaisedButton label={ (<h2>Create</h2>) } style={ mainButtonStyle } labelColor='#424949' labelStyle={ labelStyle } />
        </Flexbox>
      </Flexbox>
    )
  }
}

export default PoliticalCapitalGame
