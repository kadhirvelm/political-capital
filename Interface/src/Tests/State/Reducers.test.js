/* global describe, expect, test */

import political_capital from '../../State/Reducers'
import * as serverActions from '../../State/ServerActions'

describe('BioBots UI Reducers', () => {
  test('should return the initial state', () => {
    const initialState = political_capital({}, {})
    expect(initialState.serverActions).toEqual({ isFetching: false })
    expect(initialState.routing).toEqual({ locationBeforeTransitions: null })
  })

  describe('Political Capital Server Actions', () => {
    test('failed requeset', () => {
      const registerRequest = political_capital({}, { type: serverActions.FAILED_REQUEST, isFetching: false, message: 'error' })
      expect(registerRequest.serverActions).toEqual({ isFetching: false, message: 'error' })
      expect(registerRequest.routing).toEqual({ locationBeforeTransitions: null })
    })

    describe('Set game type actions', () => {
      test('SET_GAME_TYPE', () => {
        const registerRequest = political_capital({}, { type: serverActions.SET_GAME_TYPE, gameType: 'Tutorial' })
        expect(registerRequest.serverActions).toEqual({ gameType: 'Tutorial' })
      })

      test('REMOVE_GAME_TYPE', () => {
        const registerRequest = political_capital({}, { type: serverActions.REMOVE_GAME_TYPE })
        expect(registerRequest.serverActions).toEqual({ gameType: undefined })
      })
    })

    describe('Joining room actions', () => {
      test('JOIN_ROOM_REQUEST', () => {
        const registerRequest = political_capital({}, { type: serverActions.JOIN_ROOM_REQUEST, isFetching: true })
        expect(registerRequest.serverActions).toEqual({ isFetching: true })
      })

      test('REMOVE_GAME_TYPE', () => {
        const registerRequest = political_capital({}, { type: serverActions.JOIN_ROOM_SUCCESS, isFetching: false, connectedRoom: 'Sample Room', managingSocket: { socket: 'Sample Socket' } })
        expect(registerRequest.serverActions).toEqual({ isFetching: false, connectedRoom: 'Sample Room', managingSocket: { socket: 'Sample Socket' }, message: '' })
      })
    })

    test('REMOVE_GAME_TYPE', () => {
      const registerRequest = political_capital({}, { type: serverActions.SET_PLAYER_NAME_SUCCESS, playerName: 'Sample Name' })
      expect(registerRequest.serverActions).toEqual({ playerName: 'Sample Name', isFetching: false, message: '' })
    })

    describe('Disconnecting room actions', () => {
      test('DISCONNECT_ROOM_REQUEST', () => {
        const registerRequest = political_capital({}, { type: serverActions.DISCONNECT_ROOM_REQUEST, isFetching: true })
        expect(registerRequest.serverActions).toEqual({ isFetching: true })
      })

      test('DISCONNECT_ROOM_SUCCESS', () => {
        const registerRequest = political_capital({}, { type: serverActions.DISCONNECT_ROOM_SUCCESS, isFetching: false })
        expect(registerRequest.serverActions).toEqual({})
      })
    })

    describe('Getting available rooms actions', () => {
      test('GET_ROOMS_REQUEST', () => {
        const registerRequest = political_capital({}, { type: serverActions.GET_ROOMS_REQUEST, isFetching: true })
        expect(registerRequest.serverActions).toEqual({ isFetching: true })
      })

      test('GET_ROOMS_SUCCESS', () => {
        const registerRequest = political_capital({}, { type: serverActions.GET_ROOMS_SUCCESS, isFetching: false, rooms: 'Sample Rooms' })
        expect(registerRequest.serverActions).toEqual({ isFetching: false, message: '', rooms: 'Sample Rooms' })
      })
    })

    describe('Getting specific rooms actions', () => {
      test('GET_SPECIFIC_ROOM_REQUEST', () => {
        const registerRequest = political_capital({}, { type: serverActions.GET_SPECIFIC_ROOM_REQUEST, isFetching: true })
        expect(registerRequest.serverActions).toEqual({ isFetching: true })
      })

      test('GET_SPECIFIC_ROOM_SUCCESS', () => {
        const registerRequest = political_capital({}, { type: serverActions.GET_SPECIFIC_ROOM_SUCCESS, isFetching: false, room: 'Test Rooms' })
        expect(registerRequest.serverActions).toEqual({ isFetching: false, message: '', room: 'Test Rooms' })
      })
    })

    test('READY_UP_SUCCESS', () => {
      const registerRequest = political_capital({}, { type: serverActions.READY_UP_SUCCESS, isFetching: false, playerName: 'Test Player', playerParty: 0 })
      expect(registerRequest.serverActions).toEqual({ isFetching: false, message: '', playerName: 'Test Player', playerParty: 0, playerReady: true })
    })

    test('IN_GAME', () => {
      const registerRequest = political_capital({}, { type: serverActions.IN_GAME, inGame: true })
      expect(registerRequest.serverActions).toEqual({ isFetching: false, inGame: true })
    })

    test('FINALIZE_PARTY_NAME', () => {
      const registerRequest = political_capital({}, { type: serverActions.FINALIZE_PARTY_NAME, isFetching: false, partyName: 'Sample Party Name' })
      expect(registerRequest.serverActions).toEqual({ isFetching: false, playerPartyName: 'Sample Party Name' })
    })

    describe('Creating room actions', () => {
      test('CREATE_ROOMS_REQUEST', () => {
        const registerRequest = political_capital({}, { type: serverActions.CREATE_ROOMS_REQUEST, isFetching: true })
        expect(registerRequest.serverActions).toEqual({ isFetching: true })
      })

      test('CREATE_ROOMS_SUCCESS', () => {
        const registerRequest = political_capital({}, { type: serverActions.CREATE_ROOMS_SUCCESS, isFetching: false, newRoom: 'Test Rooms' })
        expect(registerRequest.serverActions).toEqual({ isFetching: false, message: '', newRoom: 'Test Rooms' })
      })
    })

    describe('Creating room actions', () => {
      test('SHOW_END_GAME_STATUS', () => {
        const registerRequest = political_capital({}, { type: serverActions.SHOW_END_GAME_STATUS, hasSeenTabulation: false })
        expect(registerRequest.serverActions).toEqual({ isFetching: false, hasSeenTabulation: false })
      })

      test('SEEN_END_GAME_STATUS', () => {
        const registerRequest = political_capital({}, { type: serverActions.SEEN_END_GAME_STATUS, hasSeenTabulation: true })
        expect(registerRequest.serverActions).toEqual({ isFetching: false, hasSeenTabulation: true })
      })
    })
  })
})
