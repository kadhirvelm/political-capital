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

export const SET_GAME_TYPE = 'SET_GAME_TYPE'
export const REMOVE_GAME_TYPE = 'REMOVE_GAME_TYPE'

function setGameType(gameType){
  return {
    type: SET_GAME_TYPE,
    gameType: gameType,
  }
}

function removeGameType(){
  return {
    type: REMOVE_GAME_TYPE,
  }
}

export function changeGameType(gameType){
  return (dispatch) => {
    if(gameType){
      dispatch(setGameType(gameType))
    } else {
      dispatch(removeGameType())
    }
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

function joinRoomSuccess(room, socket){
  return {
    type: JOIN_ROOM_SUCCESS,
    isFetching: false,
    connectedRoom: room,
    managingSocket: socket,
  }
}

export function setRooms(room, socket) {
  return (dispatch) => {
    dispatch(joinRoomRequest(room))
    dispatch(joinRoomSuccess(room, socket))
    dispatch(changeGameType(room.gameType))
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

export const GET_ROOMS_REQUEST = 'GET_ROOMS_REQUEST'
export const GET_ROOMS_SUCCESS = 'GET_ROOMS_SUCCESS'

function getRoomsRequeset(){
  return {
    type: GET_ROOMS_REQUEST,
    isFetching: true,
  }
}

function getRoomsSuccess(rooms){
  return {
    type: GET_ROOMS_SUCCESS,
    isFetching: false,
    rooms,
  }
}

export function getCurrentRooms(callback){
  return (dispatch) => {
    dispatch(getRoomsRequeset())
    $.ajax({
      url: process.env.REACT_APP_POLITICAL_CAPITAL + '/rooms',
      type: 'GET',
      dataType: 'json',
      contentType: 'application/json',
      cache: false,
      success: function(data) {
        dispatch(getRoomsSuccess(data))
        if (callback) {
          callback(data)
        }
      },
      error: function(error) {
        dispatch(failed(error))
      },
    })
  }
}

export const GET_SPECIFIC_ROOM_REQUEST = 'GET_SPECIFIC_ROOM_REQUEST'
export const GET_SPECIFIC_ROOM_SUCCESS = 'GET_SPECIFIC_ROOM_SUCCESS'

function getSpecificRoomRequest(){
  return {
    type: GET_SPECIFIC_ROOM_REQUEST,
    isFetching: true,
  }
}

function getSpecificRoomSuccess(room){
  return {
    type: GET_SPECIFIC_ROOM_SUCCESS,
    isFetching: false,
    room,
  }
}

export function getSpecificRoom(roomID, callback){
  const data = { roomID: roomID }
  return (dispatch) => {
    dispatch(getSpecificRoomRequest())

    $.ajax({
      url: process.env.REACT_APP_POLITICAL_CAPITAL + '/room/exists',
      type: 'POST',
      data: JSON.stringify(data),
      dataType: 'json',
      contentType: 'application/json',
      cache: false,
      success: function(room) {
        dispatch(getSpecificRoomSuccess(room))
        if (callback) {
          callback(room)
        }
      },
      error: function(error) {
        console.log(error)
        dispatch(failed(error))
      },
    })
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

function createRoomsSuccess(newRoom){
  return {
    type: CREATE_ROOMS_SUCCESS,
    isFetching: false,
    newRoom,
  }
}

export function createNewRoom(name, password, admin, gameType, callback){
  const data = { roomName: name, password: password, admin: admin, gameType: gameType }
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
