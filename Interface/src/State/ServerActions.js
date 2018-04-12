import $ from 'jquery'

export const FAILED_REQUEST = 'FAILED_REQUEST'
export const RESET = 'RESET'

function reset(){
  return {
    type: RESET,
  }
}

export function resetEverything(){
  return (dispatch) => {
    dispatch(reset())
  }
}

export const JOIN_ROOM_REQUEST = 'JOIN_ROOM_REQUEST'
export const JOIN_ROOM_SUCCESS = 'JOIN_ROOM_SUCCESS'

function failed(message){
  return {
    type: FAILED_REQUEST,
    isFetching: false,
    message,
  }
}

function joinRoomRequest(){
  return {
    type: JOIN_ROOM_REQUEST,
    isFetching: true,
  }
}

function joinRoomSuccess(room){
  return {
    type: JOIN_ROOM_SUCCESS,
    isFetching: false,
    connectedRoom: room,
  }
}

export function attemptToJoinRoom(id, callback) {
  return (dispatch) => {
    dispatch(joinRoomRequest())
    $.ajax({
      url: process.env.REACT_APP_POLITICAL_CAPITAL + '/rooms/exists',
      type: 'POST',
      data: JSON.stringify({ _id: id }),
      dataType: 'json',
      contentType: 'application/json',
      cache: false,
      success: function(response) {
        dispatch(joinRoomSuccess(response.room))
      },
      error: function(error) {
        dispatch(failed(error))
        callback(error)
      },
    })
  }
}

export const SET_PLAYER_NAME_SUCCESS = 'SET_PLAYER_NAME_SUCCESS'

function setPlayerNameSuccess(playerName){
  return {
    type: SET_PLAYER_NAME_SUCCESS,
    isFetching: false,
    playerName,
  }
}

export function setPlayerName(playerName) {
  return (dispatch) => {
    dispatch(setPlayerNameSuccess(playerName))
  }
}

export const DISCONNECT_ROOM_REQUEST = 'DISCONNECT_ROOM_REQUEST'
export const DISCONNECT_ROOM_SUCCESS = 'DISCONNECT_ROOM_SUCCESS'

function disconnectRequest(){
  return {
    type: DISCONNECT_ROOM_REQUEST,
    isFetching: true,
  }
}

function disconnectSuccess(){
  return {
    type: DISCONNECT_ROOM_SUCCESS,
    isFetching: false,
  }
}

export function disconnect() {
  return (dispatch) => {
    dispatch(disconnectRequest())
    dispatch(disconnectSuccess())
  }
}

export const READY_UP_SUCCESS = 'READY_UP_SUCCESS'

function readyUpSuccess(name, party){
  return {
    type: READY_UP_SUCCESS,
    isFetching: false,
    playerName: name,
    playerParty: party,
  }
}

export function readyUp(name, party, callback){
  return (dispatch) => {
    dispatch(readyUpSuccess(name, party))
    if (callback) {
      callback(name, party)
    }
  }
}

export const IN_GAME = 'IN_GAME'

function inGameSuccess(canStartGame){
  return {
    type: IN_GAME,
    inGame: canStartGame,
  }
}

export function inGame(canStartGame){
  return (dispatch) => {
    dispatch(inGameSuccess(canStartGame))
  }
}

export const FINALIZE_PARTY_NAME = 'FINALIZE_PARTY_NAME'

function finalizePartyNameSuccess(partyName){
  return {
    type: FINALIZE_PARTY_NAME,
    isFetching: false,
    partyName: partyName,
  }
}

export function finalizePartyName(partyName, callback){
  return (dispatch) => {
    dispatch(finalizePartyNameSuccess(partyName))
    if (callback) {
      callback(partyName)
    }
  }
}

export const CREATE_ROOMS_REQUEST = 'CREATE_ROOMS_REQUEST'
export const CREATE_ROOMS_SUCCESS = 'CREATE_ROOMS_SUCCESS'

function createRoomsRequeset(){
  return {
    type: CREATE_ROOMS_REQUEST,
    isFetching: true,
  }
}

function createRoomsSuccess(connectedRoom){
  return {
    type: CREATE_ROOMS_SUCCESS,
    isFetching: false,
    connectedRoom,
  }
}

export function createNewRoom(id, gameType, callback){
  const data = { _id: id, gameType: gameType }
  return (dispatch) => {
    dispatch(createRoomsRequeset())
    $.ajax({
      url: process.env.REACT_APP_POLITICAL_CAPITAL + '/rooms',
      type: 'POST',
      data: JSON.stringify(data),
      dataType: 'json',
      contentType: 'application/json',
      cache: false,
      success: function(returnedData) {
        dispatch(createRoomsSuccess(returnedData))
        if (callback) {
          callback(returnedData)
        }
      },
      error: function(error) {
        dispatch(failed(error.responseJSON))
      },
    })
  }
}

export const SHOW_END_GAME_STATUS = 'SHOW_END_GAME_STATUS'
export const SEEN_END_GAME_STATUS = 'SEEN_END_GAME_STATUS'

function showEndGameStatus(){
  return {
    type: SHOW_END_GAME_STATUS,
    hasSeenTabulation: false,
  }
}

function seenEndGameStatus(){
  return {
    type: SEEN_END_GAME_STATUS,
    hasSeenTabulation: true,
  }
}

export function changeEndGameStatus(hasSeen){
  return (dispatch) => {
    if(hasSeen){
      dispatch(seenEndGameStatus())
    } else {
      dispatch(showEndGameStatus())
    }
  }
}

export const IS_JOINING_ROOM = 'IS_JOINING_ROOM'

function joinRoom(){
  return {
    type: IS_JOINING_ROOM,
    isJoiningRoom: true,
  }
}

export function isJoiningRoom(){
  return (dispatch) => {
    dispatch(joinRoom())
  }
}

export const IS_CREATING_ROOM = 'IS_CREATING_ROOM'

function createRoom(){
  return {
    type: IS_CREATING_ROOM,
    isCreatingRoom: true,
  }
}

export function isCreatingRoom(){
  return (dispatch) => {
    dispatch(createRoom())
  }
}
