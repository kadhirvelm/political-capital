import './tempPolyfills'
import 'jest-enzyme'
import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

import jsdom from 'jsdom'
const { JSDOM } = jsdom

configure({ adapter: new Adapter() })

global.requestAnimationFrame = function(callback) {
  setTimeout(callback, 0)
}

const { document } = (new JSDOM('<!doctype html><html><body></body></html>')).window

global.document = document
global.window = document.defaultView
global.navigator = window.navigator
window.URL = {}
window.URL.createObjectURL = () => {}
