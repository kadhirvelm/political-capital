/* global describe, beforeAll, beforeEach, test, expect */

import React from 'react'
import PropTypes from 'prop-types'

import { mount } from 'enzyme'
import Game from '../../../Components/Game/Game'
import injectTapEventPlugin from 'react-tap-event-plugin'

import political_capital from '../../../State/Reducers'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { getMuiTheme } from 'material-ui/styles'
import sinon from 'sinon'

import { assoc } from 'ramda'
import { _ } from 'underscore'

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

    application = mount(<Game { ...props } />, {
      context: { store: mockStore(political_capital), muiTheme: muiTheme, router: router },
      childContextTypes: { store: PropTypes.object, muiTheme: PropTypes.object, router: PropTypes.object },
    })
  })

  test('Renders connect by default', () => {
    expect(application).not.toBeUndefined()
    expect(application.find({ id: 'Political Capital Game' }).hostNodes().length).toBe(1)
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
  })
})
