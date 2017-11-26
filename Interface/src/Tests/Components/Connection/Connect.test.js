/* global describe, beforeAll, beforeEach, jest, test, expect */

import React from 'react'
import PropTypes from 'prop-types'

import { mount } from 'enzyme'
import Connect from '../../../Components/Connection/Connect'
import injectTapEventPlugin from 'react-tap-event-plugin'

import political_capital from '../../../State/Reducers'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { getMuiTheme } from 'material-ui/styles'
import sinon from 'sinon'

import { DEBUG_SOCKET_MANAGER, selectIdFromChildren } from '../../TestUtil'
import * as serverActions from '../../../State/ServerActions'

const middlewares = [ thunk ]
const mockStore = configureMockStore(middlewares, political_capital)

describe('Register components', () => {
  let dispatch
  let application

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

    const props = {
      dispatch: dispatch,
      connectedRoom: { roomName: 'Sample Room', admin: 'ADMIN PLAYER' },
    }

    process.env.REACT_APP_POLITICAL_CAPITAL = process.env.REACT_APP_POLITICAL_CAPITAL || 'http://ec2-54-193-47-210.us-west-1.compute.amazonaws.com:3000'

    application = mount(<Connect { ...props } />, {
      context: { store: mockStore(political_capital), muiTheme: muiTheme, router: router },
      childContextTypes: { store: PropTypes.object, muiTheme: PropTypes.object, router: PropTypes.object },
    })
  })

  test('Renders connect by default', () => {
    expect(application).not.toBeUndefined()
    expect(application.find({ id: 'Room Setup' }).hostNodes().length).toBe(1)
  })

  describe('Testing socket connection', () => {
    let managingSocketManager
    let managingSocket

    beforeEach(() => {
      managingSocketManager = new DEBUG_SOCKET_MANAGER()
      managingSocket = managingSocketManager.socket('/default')
      application.setState({ managingSocket: managingSocket })
      application.instance().componentWillMount()
    })

    test('Testing debug connection', () => {
      managingSocket.onCommands.allPlayersReady(true)
      expect(application.state('startGame')).toBeTruthy()
      expect(managingSocket.emit.callCount).toBe(1)
      expect(managingSocket.emit.getCall(0).args).toEqual([ 'getFullGame' ])
    })

    test('Entering player name', () => {
			managingSocket.emit.resetHistory()
      application.setState({ submitName: true })
      const dialog = application.find({ id: 'Name' })
      expect(dialog.length).toBe(1)
      expect(application.state('submitName')).toBeTruthy()

      const nameField = selectIdFromChildren(dialog.props().children, 'Name Field')
      expect(nameField).not.toBeUndefined()
      nameField.props.onChange({ target: { value: '   Other player' } })
      expect(application.state('playerName')).toEqual('Other player')

      const submitButton = selectIdFromChildren(dialog.props().actions, 'Join')
      expect(submitButton).not.toBeUndefined()
			submitButton.props.onTouchTap()
			expect(application.state('error')).not.toBeUndefined()
			const fetchingError = application.state('error')

			application.setState({ playerNames: [ 'Other player' ] })
			submitButton.props.onTouchTap()
			expect(application.state('error')).not.toBeUndefined()
			expect(application.state('error')).not.toEqual(fetchingError)

			nameField.props.onChange({ target: { value: 'New Name' } })
			submitButton.props.onTouchTap()
			expect(dispatch.getCall(0).args[0].toString()).toEqual(serverActions.setPlayerName('New Name').toString())
			expect(managingSocket.emit.getCall(0).args).toEqual([ 'newPlayer', 'New Name' ])
			expect(managingSocket.emit.getCall(1).args).toEqual([ 'playerColorSelected', { player: 'New Name', color: application.state('playerParty') } ])
    })
  })
})
