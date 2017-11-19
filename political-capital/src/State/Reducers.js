import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import { dissoc } from 'ramda'

import {
	FAILED_REQUEST,
	CREATE_ROOMS_REQUEST, CREATE_ROOMS_SUCCESS,
	GET_ROOMS_REQUEST, GET_ROOMS_SUCCESS,
	JOIN_ROOM_REQUEST, JOIN_ROOM_SUCCESS,
	DISCONNECT_ROOM_REQUEST, DISCONNECT_ROOM_SUCCESS,
	SET_PLAYER_NAME_SUCCESS,
	READY_UP_SUCCESS, IN_GAME,
	FINALIZE_PARTY_NAME,
  SHOW_END_GAME_STATUS, SEEN_END_GAME_STATUS,
  SET_GAME_TYPE, REMOVE_GAME_TYPE
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
          newRoom: action.rooms,
          message: '',
        })
      case GET_ROOMS_REQUEST:
        return Object.assign({}, state, fetch)
      case GET_ROOMS_SUCCESS:
        return Object.assign({}, state, fetch, {
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
        return Object.assign({}, state, fetch, {
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
        return Object.assign({}, state, fetch, {
          inGame: action.inGame,
        })
      case FINALIZE_PARTY_NAME:
        return Object.assign({}, state, fetch, {
          playerPartyName: action.partyName,
        })
      case SHOW_END_GAME_STATUS:
        return Object.assign({}, state, fetch, {
          hasSeenTabulation: action.hasSeenTabulation,
        })
      case SEEN_END_GAME_STATUS:
        return Object.assign({}, state, fetch, {
          hasSeenTabulation: action.hasSeenTabulation,
        })
      case SET_GAME_TYPE:
        return Object.assign({}, state, fetch, {
          gameType: action.gameType,
        })
      case REMOVE_GAME_TYPE:
        return Object.assign({}, state, fetch, {
          gameType: action.gameType,
        })
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
