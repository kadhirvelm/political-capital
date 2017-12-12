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

    application = () => {
      return mount(<Game { ...props } />, {
        context: { store: mockStore(political_capital), muiTheme: muiTheme, router: router },
        childContextTypes: { store: PropTypes.object, muiTheme: PropTypes.object, router: PropTypes.object },
      })
    }
  })

  test('Renders connect by default', () => {
    expect(application()).not.toBeUndefined()
    expect(application().find({ id: 'Political Capital Game' }).hostNodes().length).toBe(1)
  })

  describe('Running the game with 10 players and 5 parties', () => {
    let allPlayers
    let managingSocketManager

    beforeAll(() => {
      managingSocketManager = new DEBUG_SOCKET_MANAGER()
      allPlayers = _.map(_.range(0, 10), () => application())
      let playerName = 0
      _.each(allPlayers, (individualPlayer) => {
        individualPlayer.setState({
          managingSocket: managingSocketManager.socket('/default'),
          connectedRoom: {
            _id: 'CONNECTED ROOM',
            roomName: 'Sample Room',
            admin: 'Test0',
            gameType: 'Vanilla',
            inGame: true,
          },
          currentRound: 0,
          parties: {},
          playerName: 'Test' + playerName,
          playerParty: playerName % 5,
          playerPartyName: '',
          players: {},
        })
        playerName += 1
        individualPlayer.instance().componentDidMount()
      })
    })

    const checkCustomConditionAllPlayers = (condition) => {
      _.each(allPlayers, condition)
    }

    const checkForSomeCustomCondition = (party, condition) => {
      _.each(allPlayers, (singlePlayer) => {
        if(singlePlayer.state('playerParty') === party){
          condition(singlePlayer)
        }
      })
    }

    const checkStateForAllPlayers = (key, value) => {
      checkCustomConditionAllPlayers((singlePlayer) => expect(singlePlayer.state(key)).toEqual(value))
    }

    const checkStateForSomePlayers = (party, key, value) => {
      checkCustomConditionAllPlayers((singlePlayer) => expect(singlePlayer.state(key)).toEqual(value))
    }

    test('Setting party names', () => {
      checkStateForAllPlayers('currentRound', 0)
      checkCustomConditionAllPlayers((singlePlayer) => expect(singlePlayer.find({ id: 'Party Name Dialog' }).length).toEqual(1))
      const firstPlayerSocket = allPlayers[0].state('managingSocket')
      firstPlayerSocket.emit.resetHistory()
      allPlayers[0].instance().adjustPartyName({ target: { value: '   sample name' } })
      expect(firstPlayerSocket.emit.callCount).toBe(1)
      expect(firstPlayerSocket.emit.getCall(0).args).toEqual([ 'setPartyName', 'sample name' ])
    })

    test.skip('Selecting party card', () => {

    })

    test.skip('Voting', () => {

    })

    test.skip('Viewing results', () => {

    })

    test.skip('Selecting and stealing party cards', () => {

    })

    test.skip('Ending the game', () => {

    })
  })
})
