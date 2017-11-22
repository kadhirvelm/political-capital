/* global describe, expect, test */

import { mapStateToProps } from '../../State/StateMethods'

describe('Map State to Props', () => {
  test('Changes the state successfully', () => {
    const state = {
      serverActions: {},
      router: [],
    }
    expect(mapStateToProps(state)).toEqual({
      serverActions:{},
    })
  })
})
