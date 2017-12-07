import { _ } from 'underscore'
export const CONNECT = 'connect'
export const DISCONNECT = 'disconnect'

import sinon from 'sinon'

export class DEBUG_SOCKET {
  constructor(namespace, properties){
    this.namespace = namespace
    this.properties = properties
    this.onCommands = {}
    this.emit = sinon.stub()
    this.disconnect = sinon.stub()
  }

  connect(){
    this.on(CONNECT, { connect: true })
  }

  on(message, ...secondPart){
    if(message in this.onCommands) {
      this.onCommands[message](secondPart)
    } else if (_.isFunction(_.head(secondPart)) && secondPart.length === 1) {
      this.onCommands[message] = _.head(secondPart)
    } else {
      console.log('No callback associated', message, secondPart, this.onCommands)
    }
  }
}

export class DEBUG_SOCKET_MANAGER {
  constructor(url, properties){
    this.url = url
    this.properties = properties
    this.sockets = {}
  }

  totalKeys(){
    return (_.keys(this.sockets) || []).length
  }

  socket(namespace){
    const currentKey = this.totalKeys()
    this.sockets[currentKey] = new DEBUG_SOCKET(namespace)
    return this.sockets[currentKey]
  }
}

export function selectIdFromChildren(parent, id){
  return _.head(_.values(_.pick(parent, (child) => child.props.id === id)))
}
