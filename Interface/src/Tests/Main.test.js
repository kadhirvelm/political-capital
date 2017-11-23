/* global describe, beforeAll, beforeEach, jest, test, expect */

import React from 'react'
import PropTypes from 'prop-types'

import { mount } from 'enzyme'
import { Main } from '../Main'
import injectTapEventPlugin from 'react-tap-event-plugin'

import { MemoryRouter } from 'react-router-dom'

import political_capital from '../State/Reducers'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { getMuiTheme } from 'material-ui/styles'
import sinon from 'sinon'
import * as ServerActions from '../State/ServerActions'

const middlewares = [ thunk ]
const mockStore = configureMockStore(middlewares, political_capital)

describe('Register components', () => {
  let dispatch
  let page
  let identify
  let reload
  let mountApplication

  beforeAll(() => {
    injectTapEventPlugin()
    // eslint-disable-next-line
    String.prototype.replaceAll = function(str1, str2, ignore) {
      // eslint-disable-next-line
      return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
    }
  })

  beforeEach(() => {
    const router = {
      history: {
        push: () => {},
        replace: () => {},
        createHref: () => {},
      },
      location: {
        pathname: '/rooms',
      },
    }
    const muiTheme = getMuiTheme()
    dispatch = sinon.stub()
    page = sinon.stub()
    identify = sinon.stub()
    reload = sinon.stub()

    const props = {
      serverActions: {},
      dispatch: dispatch,
    }

    window.analytics = {}
    window.analytics.page = page
    window.analytics.identify = identify

    document.location = {}
    document.location.reload = reload

    process.env.REACT_APP_POLITICAL_CAPITAL = 'http://192.168.99.103:3001'

    Object.defineProperty(window.location, 'href', {
      writable: true,
      value: 'http://localhost/',
    })

    mountApplication = (initialEntries, passedProps) => {
      const finalProps = passedProps || props
      return mount(
        <MemoryRouter initialEntries={ initialEntries }>
          <Main { ...finalProps } />
        </MemoryRouter>, {
          context: { store: mockStore(political_capital), muiTheme: muiTheme, router: router },
          childContextTypes: { store: PropTypes.object, muiTheme: PropTypes.object, router: PropTypes.object },
        })
    }
  })

  test('Renders rooms by default', () => {
    const application = mountApplication()
    expect(application).not.toBeUndefined()
    expect(window.location.href.endsWith('rooms')).toBeTruthy()
  })

  describe('Testing game', () => {
    let application

    beforeEach(() => {
      application = mountApplication([ '/game' ], {
        serverActions: {
          connectedRoom: { _id: 'TEST ROOM 1', roomName: 'Sample%20Room', gameType: 'Tutorial', players: [ { TestPlayer: {} } ] },
          playerName: 'Test Player',
          playerParty: 0,
          inGame: true,
          playerReady: true,
        },
      })
    })

    test('Rendering in game', () => {
      expect(application).not.toBeUndefined()
    })
  })

  describe('Testing rooms', () => {
    let application

    beforeEach(() => {
      application = mountApplication([ '/rooms' ])
    })

    test('Rendering empty rooms', () => {
      expect(application).not.toBeUndefined()
      expect(window.location.href.endsWith('rooms')).toBeTruthy()
      expect(application.find({ id: 'Room Connection' }).hostNodes().length).toBe(1)
    })

    test('Rendering non-empty rooms', () => {
      const getRoomsStub = sinon.stub(ServerActions, 'getCurrentRooms').callsFake((callback) => {
        callback([ { _id: 'TEST ROOM 1', roomName: 'Sample%20Room', gameType: 'Tutorial', players: [ { TestPlayer: {} } ] } ])
        expect(application).not.toBeUndefined()
      })
      const refreshButton = application.find({ id: 'Refresh' }).hostNodes()
      expect(refreshButton).not.toBeUndefined()
      refreshButton.props().onTouchTap()
      getRoomsStub.restore()
    })
  })

  describe('Testing connect', () => {
    let application

    beforeEach(() => {
      application = mountApplication([ '/connect' ], {
        serverActions: {
          connectedRoom: { _id: 'TEST ROOM 1', roomName: 'Sample%20Room', gameType: 'Tutorial', players: [ { TestPlayer: {} } ] },
          playerName: 'Test Player',
          playerParty: 0,
          inGame: false,
          playerReady: false,
        },
      })
    })

    test('Rendering connected room', () => {
      expect(application).not.toBeUndefined()
    })
  })

  describe('Testing loading', () => {
    let application

    beforeEach(() => {
      application = mountApplication([ '/*' ])
    })

    test('Viewing loading screen', () => {
      expect(application).not.toBeUndefined()
      expect(application.find({ id: 'Loading' }).hostNodes().length).toBe(1)
    })
  })
})
