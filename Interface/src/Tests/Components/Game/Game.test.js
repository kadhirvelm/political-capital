/* global describe, beforeAll, afterAll, beforeEach, test, expect */

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

import { assoc, mergeAll } from 'ramda'
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
    const TOTAL_PLAYERS = 10
    const TOTAL_PARTIES = 5

    beforeAll(() => {
      managingSocketManager = new DEBUG_SOCKET_MANAGER()
      allPlayers = _.map(_.range(0, TOTAL_PLAYERS), () => application())
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
          dispatch: sinon.stub(),
          currentRound: 0,
          parties: {},
          playerName: 'Test' + playerName,
          playerParty: playerName % TOTAL_PARTIES,
          playerPartyName: '',
          players: {},
          rounds: {},
        })
        playerName += 1
        individualPlayer.instance().componentDidMount()
      })
    })

    const performCallbackOnEachPlayer = (callback) => {
      _.each(allPlayers, callback)
    }

    const performCallbackOnParty = (party, callback) => {
      _.each(allPlayers, (singlePlayer) => {
        if(singlePlayer.state('playerParty') === party){
          callback(singlePlayer)
        }
      })
    }

    const checkStateForAllPlayers = (key, value) => {
      performCallbackOnEachPlayer((singlePlayer) => expect(singlePlayer.state(key)).toEqual(value))
    }

    const checkStateForSomePlayers = (party, key, value) => {
      performCallbackOnParty((singlePlayer) => expect(singlePlayer.state(key)).toEqual(value))
    }

    test.skip('Setting party names', () => {
      checkStateForAllPlayers('currentRound', 0)
      performCallbackOnEachPlayer((singlePlayer) => expect(singlePlayer.find({ id: 'Party Name Dialog' }).length).toEqual(1))
      
      const firstPlayerSocket = allPlayers[0].state('managingSocket')
      firstPlayerSocket.emit.resetHistory()
      allPlayers[0].instance().adjustPartyName({ target: { value: '   sample name' } })
      expect(firstPlayerSocket.emit.callCount).toBe(1)
      expect(firstPlayerSocket.emit.getCall(0).args).toEqual([ 'setPartyName', 'sample name' ])
      expect(allPlayers[0].state('playerPartyName')).toEqual('sample name')

      managingSocketManager.emitToParty(allPlayers[0].state('playerParty'), 'getPartyName', 'sample name')
      checkStateForSomePlayers(allPlayers[0].state('playerParty'), 'playerPartyName', 'sample name')

      const finalizePartyNameStub = sinon.stub(serverActions, 'finalizePartyName')
      allPlayers[0].instance().finalizePartyName()
      expect(firstPlayerSocket.emit.callCount).toBe(2)
      expect(firstPlayerSocket.emit.getCall(1).args).toEqual([ 'finalizePartyName', 'sample name' ])
      expect(finalizePartyNameStub.callCount).toBe(1)
      expect(finalizePartyNameStub.getCall(0).args).toEqual([ 'sample name' ])
    
      finalizePartyNameStub.resetHistory()
      managingSocketManager.emitToParty(allPlayers[0].state('playerParty'), 'finalizePartyName', 'sample name')
      checkStateForSomePlayers(allPlayers[0].state('playerParty'), 'playerPartyName', 'sample name')
      expect(finalizePartyNameStub.callCount).toBe(TOTAL_PLAYERS / TOTAL_PARTIES)

      const parties = {}
      const players = _.map(_.filter(allPlayers, (singlePlayer) => singlePlayer.state('playerParty') === allPlayers[0].state('playerParty')), (singlePartyPlayer) => singlePartyPlayer.state('playerName'))
      parties[allPlayers[0].state('playerParty')] = { partyCards: {}, partyName: 'sample name', players: players }
      performCallbackOnEachPlayer((singlePlayer) => singlePlayer.setState({ parties: parties }))
      
      const secondPlayerSocket = allPlayers[1].state('managingSocket')
      secondPlayerSocket.emit.resetHistory()
      allPlayers[1].instance().adjustPartyName({ target: { value: '   sample name' } })
      allPlayers[1].instance().finalizePartyName()
      expect(allPlayers[1].state('errorName')).toEqual('That name is already taken')
    })

    test('Viewing resolution and chance, then selecting party card', () => {
      const newState = {
        currentRound: 1,
        firstFetchedGame: true,
        playerPartyName: 'sample party names',
        parties: mergeAll(_.map(_.range(0, TOTAL_PLAYERS), (index) => {
          return assoc(index, { partyCards: { yes: [ '2x', 'Steal', 'Senator' ] }, partyName: 'Test Party ' + index, players: [] }, {})
        })),
        players: mergeAll(_.map(_.range(0, TOTAL_PLAYERS), (index) => {
          return assoc('Test' + index, { isReady: true, name: 'Test' + index, party: index % TOTAL_PARTIES, politicalCapital: 60, senators: 3 }, {})
        })),
        rounds: {
          1: {
            chance: {
              effect: [ '0.5x Everything' ],
              flavorText: 'SAMPLE TEXT CHANCE',
            },
            individualVotes: {},
            partyCards: {},
            resolution: {
              no: { inFavor: 20, against: 10 },
              yes: { inFavor: 'Sen', against: '-Sen' },
              flavorText: 'SAMPLE TEXT RESOLUTION',
            },
          },
        },
      }
      performCallbackOnEachPlayer((singlePlayer) => {
        singlePlayer.setState(newState)
        singlePlayer.update()
      })
      performCallbackOnEachPlayer((singlePlayer) => expect(singlePlayer.find({ id: 'Game State' }).hostNodes().props().children.props.children.props.id).toEqual('Resolution and Chance'))
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
