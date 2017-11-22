import './tempPolyfills'
import 'jest-enzyme'
import jsdom from 'jsdom'
import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

configure({ adapter: new Adapter() })

global.requestAnimationFrame = function(callback) {
  setTimeout(callback, 0)
}

global.document = jsdom.jsdom('<!doctype html><html><body></body></html>')
global.window = document.defaultView
global.navigator = window.navigator
