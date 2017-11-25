/* global describe, expect, test, beforeAll */

import { saveState, loadState } from '../../State/StateStoreLoad'
import { _ } from 'underscore'
import sinon from 'sinon'

describe('Testing out the state saving mechanisms', () => {
  beforeAll(() => {
    const mock = (() => {
		    let store = {}
		    return {
		        getItem: (key) => {
		            return store[key]
		        },
		        setItem: (key, value) => {
		            store[key] = value.toString()
		        },
		        clear: () => {
		            store = {}
		        },
		    }
    })()
    Object.defineProperty(window, 'localStorage', { value: mock, configurable: true, enumerable: true, writable: true })
  })

  test('loads the state without errors', () => {
    expect(loadState()).toBeUndefined()
  })

  test('saves the state without errors', () => {
    const state = {
      test: 'example',
      auth: {
        isAuthenticated: true,
      },
    }
    saveState(state)
  })

  test('saves, then loads the state', () => {
    const state = {
      test: 'example',
      auth: {
        isAuthenticated: true,
      },
    }
    saveState(state)
    expect(loadState()).toEqual(state)
  })

  let state = {
    test: 'example',
    auth: {
      isAuthenticated: true,
    },
  }

  test('throws an error when unable to write to the cache', () => {
    state = _.extend(state, { state: state })

    const stub = sinon.stub(console, 'error')
    saveState(state)
    expect(stub.callCount).toBe(1)
    expect(stub.getCall(0).args.length).toBe(3)
    expect(stub.getCall(0).args[0]).toEqual('Writing state error -> ')
    expect(stub.getCall(0).args[1]).toEqual(new TypeError('Converting circular structure to JSON'))
    expect(stub.getCall(0).args[2]).toEqual(state)
  })
})
