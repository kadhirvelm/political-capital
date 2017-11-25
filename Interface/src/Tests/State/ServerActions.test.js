/* global describe, expect, beforeAll, test, beforeEach, afterEach */

import $ from 'jquery'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as serverActions from '../../State/ServerActions'
import sinon from 'sinon'

const middlewares = [ thunk ]
const mockStore = configureMockStore(middlewares)

describe('Authenticate Actions', () => {
  let store
  let callback

  beforeAll(() => {
    callback = sinon.stub()
  })

  beforeEach(() => {
    store = mockStore({})
    callback.resetHistory()
  })

  afterEach(() => {
    store.clearActions()
  })

  describe('Non ajax server actions', () => {
    test('Changing game type', () => {
      const setGameType = {
        type: 'SET_GAME_TYPE',
        gameType: 'SAMPLE GAME TYPE',
      }

      const removeGameType = {
        type: 'REMOVE_GAME_TYPE',
      }

      store.dispatch(serverActions.changeGameType('SAMPLE GAME TYPE'))
      store.dispatch(serverActions.changeGameType())
      expect(store.getActions().length).toBe(2)
      expect(store.getActions()[0]).toEqual(setGameType)
      expect(store.getActions()[1]).toEqual(removeGameType)
    })

    test('Joining room', () => {
      const joinRoomRequest = {
        type: 'JOIN_ROOM_REQUEST',
        isFetching: true,
      }

      const joinRoomSuccess = {
        type: 'JOIN_ROOM_SUCCESS',
        isFetching: false,
        connectedRoom: { gameType: 'Sample Type', name: 'SAMPLE ROOM' },
        managingSocket: 'SAMPLE SOCKET',
      }

      store.dispatch(serverActions.setRooms({ gameType: 'Sample Type', name: 'SAMPLE ROOM' }, 'SAMPLE SOCKET'))
      expect(store.getActions().length).toBe(3)
      expect(store.getActions()[0]).toEqual(joinRoomRequest)
      expect(store.getActions()[1]).toEqual(joinRoomSuccess)
    })

    test('Setting player name', () => {
      const setPlayerNameSuccess = {
        type: 'SET_PLAYER_NAME_SUCCESS',
        isFetching: false,
        playerName: 'SAMPLE NAME',
      }

      store.dispatch(serverActions.setPlayerName('SAMPLE NAME'))
      expect(store.getActions().length).toBe(1)
      expect(store.getActions()[0]).toEqual(setPlayerNameSuccess)
    })

    test('Disconnecting', () => {
      const disconnectRequest = {
        type: 'DISCONNECT_ROOM_REQUEST',
        isFetching: true,
      }

      const disconnectSuccess = {
        type: 'DISCONNECT_ROOM_SUCCESS',
        isFetching: false,
      }

      store.dispatch(serverActions.disconnect())
      expect(store.getActions().length).toBe(2)
      expect(store.getActions()[0]).toEqual(disconnectRequest)
      expect(store.getActions()[1]).toEqual(disconnectSuccess)
    })

    test('Readying up', () => {
      const readyUpSuccess = {
        type: 'READY_UP_SUCCESS',
        isFetching: false,
        playerName: 'SAMPLE NAME',
        playerParty: 'PARTY',
      }

      const readyUpCallback = sinon.stub()

      store.dispatch(serverActions.readyUp('SAMPLE NAME', 'PARTY', readyUpCallback))
      expect(store.getActions().length).toBe(1)
      expect(store.getActions()[0]).toEqual(readyUpSuccess)
      expect(readyUpCallback.callCount).toBe(1)
      expect(readyUpCallback.getCall(0).args).toEqual([ 'SAMPLE NAME', 'PARTY' ])
    })

    test('In Game', () => {
      const inGameSuccess = {
        type: 'IN_GAME',
        inGame: 'IN GAME VAR',
      }

      store.dispatch(serverActions.inGame('IN GAME VAR'))
      expect(store.getActions().length).toBe(1)
      expect(store.getActions()[0]).toEqual(inGameSuccess)
    })

    test('Finalize party name', () => {
      const inGameSuccess = {
        type: 'FINALIZE_PARTY_NAME',
        isFetching: false,
        partyName: 'SAMPLE PARTY NAME',
      }

      const finalizeCallback = sinon.stub()

      store.dispatch(serverActions.finalizePartyName('SAMPLE PARTY NAME', finalizeCallback))
      expect(store.getActions().length).toBe(1)
      expect(store.getActions()[0]).toEqual(inGameSuccess)
      expect(finalizeCallback.getCall(0).args).toEqual([ 'SAMPLE PARTY NAME' ])
    })

    test('Change end game status', () => {
      const showEndGameStatus = {
        type: 'SHOW_END_GAME_STATUS',
        hasSeenTabulation: false,
      }

      const seenEndGameStatus = {
        type: 'SEEN_END_GAME_STATUS',
        hasSeenTabulation: true,
      }

      store.dispatch(serverActions.changeEndGameStatus('HAS SEEN VAR'))
      store.dispatch(serverActions.changeEndGameStatus())
      expect(store.getActions().length).toBe(2)
      expect(store.getActions()[0]).toEqual(seenEndGameStatus)
      expect(store.getActions()[1]).toEqual(showEndGameStatus)
    })
  })

  describe('Server Actions', () => {
    let stub

    afterEach(() => {
      stub.restore()
    })

    test('Get current rooms', () => {
		 	stub = sinon.stub($, 'ajax').callsFake((calls) => {
        if(calls.url.endsWith('/rooms')){
          calls.success('Sample Rooms')
        }
      })

      const getRoomsRequeset = {
        type: 'GET_ROOMS_REQUEST',
        isFetching: true,
      }

      const getRoomsSuccess = {
        type: 'GET_ROOMS_SUCCESS',
        isFetching: false,
        rooms: 'Sample Rooms',
      }

      store.dispatch(serverActions.getCurrentRooms(callback))
      expect(store.getActions().length).toBe(2)
      expect(store.getActions()[0]).toEqual(getRoomsRequeset)
      expect(store.getActions()[1]).toEqual(getRoomsSuccess)
      expect(stub.callCount).toBe(1)
    })

    test('Get specific room', () => {
      stub = sinon.stub($, 'ajax').callsFake((calls) => {
        if(calls.url.endsWith('/room/exists')){
          calls.success('Sample Single Room ' + JSON.parse(calls.data).roomID)
        }
      })

      const getSpecificRoomRequest = {
        type: 'GET_SPECIFIC_ROOM_REQUEST',
        isFetching: true,
      }

      const getSpecificRoomSuccess = {
        type: 'GET_SPECIFIC_ROOM_SUCCESS',
        isFetching: false,
        room: 'Sample Single Room ID',
      }

      store.dispatch(serverActions.getSpecificRoom('ID', callback))
      expect(store.getActions().length).toBe(2)
      expect(store.getActions()[0]).toEqual(getSpecificRoomRequest)
      expect(store.getActions()[1]).toEqual(getSpecificRoomSuccess)
      expect(stub.callCount).toBe(1)
    })

    test('Create new room', () => {
      stub = sinon.stub($, 'ajax').callsFake((calls) => {
        if(calls.url.endsWith('/rooms')){
          calls.success(JSON.parse(calls.data))
        }
      })

      const createRoomsRequeset = {
        type: 'CREATE_ROOMS_REQUEST',
        isFetching: true,
      }

      const createRoomsSuccess = {
        type: 'CREATE_ROOMS_SUCCESS',
        isFetching: false,
        newRoom: { roomName: 'Name', password: 'Pass', admin: 'Name', gameType: 'Tutorial' },
      }

      store.dispatch(serverActions.createNewRoom('Name', 'Pass', 'Name', 'Tutorial', callback))
      expect(store.getActions().length).toBe(2)
      expect(store.getActions()[0]).toEqual(createRoomsRequeset)
      expect(store.getActions()[1]).toEqual(createRoomsSuccess)
      expect(stub.callCount).toBe(1)
    })
  })
})
