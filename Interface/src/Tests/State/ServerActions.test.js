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
