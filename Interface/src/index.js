import React from 'react'
import ReactDOM from 'react-dom'
import Main from './Main'
import GameOverview from './Components/OutsideGame/GameOverviewScreen'
import './styles/global.css'

import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import thunkMiddleware from 'redux-thunk'
import injectTapEventPlugin from 'react-tap-event-plugin'

import political_capital from './State/Reducers'
import { saveState, loadState } from './State/StateStoreLoad'

import {
  grey100, grey300, grey400, grey500,
  white, darkBlack, fullBlack,
} from 'material-ui/styles/colors'

import { colors } from './styles/colors'

import { fade } from 'material-ui/utils/colorManipulator'

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import { getMuiTheme } from 'material-ui/styles'

const createStoreWithThunk = applyMiddleware(thunkMiddleware)(createStore)
const persistedState = loadState()
const store = createStoreWithThunk(political_capital, persistedState)

store.subscribe(() => {
  saveState(store.getState())
})

injectTapEventPlugin()

const muiTheme = getMuiTheme({
  fontFamily: 'Didact Gothic, sans-serif',
  palette: {
    primary1Color: colors.LIGHT_BLUE,
    primary2Color: colors.MEDIUM_BLUE,
    primary3Color: grey400,
    accent1Color: colors.DARK_BLUE,
    accent2Color: grey100,
    accent3Color: grey500,
    textColor: darkBlack,
    alternateTextColor: white,
    canvasColor: white,
    borderColor: grey300,
    disabledColor: fade(darkBlack, 0.3),
    pickerHeaderColor: colors.LIGHT_BLUE,
    clockCircleColor: fade(darkBlack, 0.07),
    shadowColor: fullBlack,
  },
})

ReactDOM.render((
  <Provider store={ store }>
  	<MuiThemeProvider muiTheme={ muiTheme }>
  		<BrowserRouter>
  			<Switch>
          <Route path='/overview/:nsp' component={ GameOverview } />
    			<Route path='*' component={ Main } />
    		</Switch>
    	</BrowserRouter>
    </MuiThemeProvider>
  </Provider>),
document.getElementById('root')
)
