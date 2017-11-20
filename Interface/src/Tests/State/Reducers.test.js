/* global describe, expect, test */

import political_capital_reducer from '../../State/Reducers'
import * as serverActions from '../../State/ServerActions'

describe('Political Capital Reducers', () => {
  test('should return the initial state', () => {
    const initialState = political_capital_reducer({}, {})
    expect(initialState.serverActions).toEqual({ isFetching: false })
  })

  test('Failed request', () => {
    const reducerState = political_capital_reducer({}, { type: serverActions.FAILED_REQUEST, isFetching: false, message: 'Test Failure' })
    expect(reducerState.serverActions).toEqual({ isFetching: false, message: 'Test Failure' })
  })

  describe('Create rooms', () => {
    test('Create rooms request', () => {
      const reducerState = political_capital_reducer({}, { type: serverActions.CREATE_ROOMS_REQUEST, isFetching: true })
      expect(reducerState.serverActions).toEqual({ isFetching: true })
    })

    test('Create rooms success', () => {
      const reducerState = political_capital_reducer({}, { type: serverActions.CREATE_ROOMS_SUCCESS, rooms: 'Test Rooms', isFetching: false, message: 'Test' })
      expect(reducerState.serverActions).toEqual({ isFetching: false, newRoom: 'Test Rooms', message: '' })
    })
  })
})
