/* global describe, beforeAll, beforeEach, afterEach, it, expect */

import React from 'react'
import PropTypes from 'prop-types'

import $ from 'jquery'

import { mount } from 'enzyme'
import { Main } from '../Main'

import injectTapEventPlugin from 'react-tap-event-plugin'

import political_capital from '../State/Reducers'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { getMuiTheme } from 'material-ui/styles'

import sinon from 'sinon'

const middlewares = [ thunk ]
const mockStore = configureMockStore(middlewares, { serverActions: { isFetching: false }, routing: {}, form: {} })

class DebugSocketServerHandler {
  constructor(nsp){
    this.nsp = nsp
  }

  connect(socket){
    this.socket = socket
  }

  on(handle, input){
    //console.log(handle, input)
  }
}

class DebugSocket {
  constructor(nsp, serverHandler){
    this.nsp = nsp
    this.serverHandler = serverHandler
    this.callbacks = {}
  }

  emit = (handler, ...input) => {
    this.serverHandler.on(handler, input)
  }

  connect(params){
    //console.log(params)
  }

  on(handle, callback){
    this.callbacks[handle] = callback
  }
}

describe('Testing the main application page', () => {
  let application
  let handler
  let muiTheme
  let router

  beforeAll(() => {
  	injectTapEventPlugin()
  })

  beforeEach(() => {
  	router = {
  		history: {
  			push: () => {},
  			replace: () => {},
  			createHref: () => {},
  		},
  	}
  	muiTheme = getMuiTheme()
    handler = sinon.spy()

  	application = mount(<Main dispatch={ handler } serverActions={ {} } />, {
  		context: { store: mockStore(political_capital), muiTheme: muiTheme, router: router },
  		childContextTypes: { store: PropTypes.object, muiTheme: PropTypes.object, router: PropTypes.object },
  	})
  })

  it('renders without crashing', () => {
    expect(application).not.toBeUndefined()
  })

  it('checks for the room connection screen by default', () => {
    expect(application.find({ id: 'Room Connection' }).length).toBe(1)
    expect(handler.callCount).toBe(1)
    application.setState({ connectedRoom: { roomName: 'Test', password: '', players: [ 'Test' ] }, managingSocket: { connected: true } })
    expect(application.find({ id: 'Room Setup' }).length).toBe(1)
    const DebugSocketServer = new DebugSocketServerHandler()
    application.setState({ inGame: true, playerName: 'Test', managingSocket: new DebugSocket('Test', DebugSocketServer) })
    expect(application.find({ id: 'Political Capital Game' }).length).toBe(1)
  })
})
