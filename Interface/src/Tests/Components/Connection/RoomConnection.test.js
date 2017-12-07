/* global describe, beforeAll, beforeEach, test, expect */

import React from 'react'
import PropTypes from 'prop-types'

import { mount } from 'enzyme'
import RoomConnection from '../../../Components/Connection/RoomConnection'
import injectTapEventPlugin from 'react-tap-event-plugin'

import political_capital from '../../../State/Reducers'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { getMuiTheme } from 'material-ui/styles'
import sinon from 'sinon'

import { DEBUG_SOCKET_MANAGER, selectIdFromChildren } from '../../TestUtil'
import * as serverActions from '../../../State/ServerActions'
import { getSpecificRoom } from '../../../State/ServerActions';

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
      socketManager: new DEBUG_SOCKET_MANAGER(),
    }

    process.env.REACT_APP_POLITICAL_CAPITAL = process.env.REACT_APP_POLITICAL_CAPITAL || 'http://ec2-54-193-47-210.us-west-1.compute.amazonaws.com:3000'

    application = mount(<RoomConnection { ...props } />, {
      context: { store: mockStore(political_capital), muiTheme: muiTheme, router: router },
      childContextTypes: { store: PropTypes.object, muiTheme: PropTypes.object, router: PropTypes.object },
    })
  })

  test('Renders connect by default', () => {
    expect(application).not.toBeUndefined()
  })

  test('Creating a new room', () => {

  })

  describe('Joining a room', () => {
    test('Joining an existing room without any errors', () => {
      const getSpecificRoomStub = sinon.stub(serverActions, 'getSpecificRoom').callsFake((roomID, callback) => {
        callback({ exists: true, inGame: false })
      })
      const joinRoom = sinon.stub()
      application.setState({ joinRoom: joinRoom })
      application.instance().connectToRoom({ password: '' })
      expect(getSpecificRoomStub.callCount).toBe(1)
      application.state('socketManager').sockets['0'].onCommands.connect()
      expect(joinRoom.callCount).toBe(1)
      getSpecificRoomStub.restore()
    })

    test('Joining a room already in game', () => {
      const getSpecificRoomStub = sinon.stub(serverActions, 'getSpecificRoom').callsFake((roomID, callback) => {
        callback({ exists: true, inGame: true })
      })
      const joinRoom = sinon.stub()
      application.setState({ joinRoom: joinRoom })
      application.instance().connectToRoom({ roomName: 'TEST ROOM', password: '' })
      expect(getSpecificRoomStub.callCount).toBe(1)
      expect(application.state('connectingErrors')).toEqual('Room TEST ROOM is already in game')
      getSpecificRoomStub.restore()
    })

    test('Joining a room that does not exist', () => {
      const getSpecificRoomStub = sinon.stub(serverActions, 'getSpecificRoom').callsFake((roomID, callback) => {
        callback({ exists: false })
      })
      const joinRoom = sinon.stub()
      application.setState({ joinRoom: joinRoom })
      application.instance().connectToRoom({ roomName: 'TEST ROOM', password: '' })
      expect(getSpecificRoomStub.callCount).toBe(1)
      expect(application.state('connectingErrors')).toEqual('Room TEST ROOM no longer exists')
      getSpecificRoomStub.restore()
    })

    test('Joining a room with a password', () => {
      application.setState({ enteredPassword: true })
      application.instance().connectToRoom({ roomName: 'TEST ROOM', password: 'TEST PASSWORD' })
      expect(application.state('enterPassword')).toBeTruthy()
      expect(application.state('error')).toEqual('Incorrect Password')
    })
  })
})
