import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import { dissoc } from 'ramda'

import {
  FAILED_REQUEST, RESET,
  CREATE_ROOMS_REQUEST, CREATE_ROOMS_SUCCESS,
  JOIN_ROOM_REQUEST, JOIN_ROOM_SUCCESS,
  DISCONNECT_ROOM_REQUEST, DISCONNECT_ROOM_SUCCESS,
  SET_PLAYER_NAME_SUCCESS,
  READY_UP_SUCCESS, IN_GAME,
  FINALIZE_PARTY_NAME,
  SHOW_END_GAME_STATUS, SEEN_END_GAME_STATUS,
  IS_JOINING_ROOM,
  IS_CREATING_ROOM,
} from './ServerActions'

import { reducer } from 'redux-form'

function serverActions(state = {
  isFetching: false,
}, action) {
  if(action && action.type && !(action.type.startsWith('@@'))){
    const fetch = {
      isFetching: action.isFetching,
    }
    switch (action.type) {
      case FAILED_REQUEST:
        return Object.assign({}, state, fetch, {
          message: action.message,
        })
      case CREATE_ROOMS_REQUEST:
        return Object.assign({}, state, fetch)
      case CREATE_ROOMS_SUCCESS:
        return Object.assign({}, state, fetch, {
          connectedRoom: action.connectedRoom,
          message: '',
        })
      case JOIN_ROOM_REQUEST:
        return Object.assign({}, state, fetch)
      case JOIN_ROOM_SUCCESS:
        return Object.assign({}, state, fetch, {
          connectedRoom: action.connectedRoom,
          managingSocket: dissoc('io', dissoc('json', action.managingSocket)),
          message: '',
        })
      case DISCONNECT_ROOM_REQUEST:
        return Object.assign({}, state, fetch)
      case DISCONNECT_ROOM_SUCCESS:
        return {}
      case SET_PLAYER_NAME_SUCCESS:
        return Object.assign({}, state, {
          playerName: action.playerName,
          message: '',
        })
      case READY_UP_SUCCESS:
        return Object.assign({}, state, fetch, {
          playerName: action.playerName,
          playerParty: action.playerParty,
          message: '',
          playerReady: true,
        })
      case IN_GAME:
        return Object.assign({}, state, {
          inGame: action.inGame,
          isAdmin: action.isAdmin,
        })
      case FINALIZE_PARTY_NAME:
        return Object.assign({}, state, fetch, {
          playerPartyName: action.partyName,
        })
      case SHOW_END_GAME_STATUS:
        return Object.assign({}, state, {
          hasSeenTabulation: action.hasSeenTabulation,
        })
      case SEEN_END_GAME_STATUS:
        return Object.assign({}, state, {
          hasSeenTabulation: action.hasSeenTabulation,
        })
      case IS_JOINING_ROOM:
        return Object.assign({}, state, fetch, {
          isJoiningRoom: action.isJoiningRoom,
        })
      case IS_CREATING_ROOM:
        return Object.assign({}, state, fetch, {
          isCreatingRoom: action.isCreatingRoom,
        })
      case RESET:
        return {}
      default:
        return state
    }
  }
  return state
}

const political_capital = combineReducers({
  serverActions,
  routing: routerReducer,
  form: reducer,
})

export default political_capital
