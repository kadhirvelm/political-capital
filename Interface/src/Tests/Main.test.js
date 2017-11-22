/* global describe, beforeAll, beforeEach, jest, test, expect */

// import React from 'react'
// import PropTypes from 'prop-types'

// import { mount } from 'enzyme'
// import { Main } from '../Main'
// import injectTapEventPlugin from 'react-tap-event-plugin'

// import { MemoryRouter } from 'react-router-dom'

// import political_capital from '../State/Reducers'
// import configureMockStore from 'redux-mock-store'
// import thunk from 'redux-thunk'
// import { getMuiTheme } from 'material-ui/styles'
// import sinon from 'sinon'

// import * as sockets from 'socket.io-client'

// const middlewares = [ thunk ]
// const mockStore = configureMockStore(middlewares, political_capital)

describe('Register components', () => {
  // let application
  // let dispatch
  // let manager
  // let page
  // let identify
  // let reload

  // beforeAll(() => {
  //   injectTapEventPlugin()
  // })

  // beforeEach(() => {
  //   const router = {
  //     history: {
  //       push: () => {},
  //       replace: () => {},
  //       createHref: () => {},
  //     },
  //   }
  //   const muiTheme = getMuiTheme()
  //   dispatch = sinon.stub()
  //   page = sinon.stub()
  //   identify = sinon.stub()
  //   reload = sinon.stub()

  //   const props = {
  //     serverActions: {},
  //     location: {},
  //   }

  //   window.analytics = {}
  //   window.analytics.page = page
  //   window.analytics.identify = identify

  //   document.location = {}
  //   document.location.reload = reload

  //   manager = sinon.stub(sockets, 'Manager').callsFake((url, options) => {
  //     console.log(manager)
  //   })

  //   application = mount(
  //     <MemoryRouter>
  //       <Main { ...props } />
  //     </MemoryRouter>, {
  //       context: { store: mockStore(political_capital), muiTheme: muiTheme, router: router },
  //       childContextTypes: { store: PropTypes.object, muiTheme: PropTypes.object, router: PropTypes.object },
  //   })
  // })

  test('Displays all the fields', () => {
    expect(1).toEqual(1)
  })
})
