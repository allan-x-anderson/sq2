// NOTE: The contents of this file will only be executed if
// you uncomment its entry in "web/static/js/app.js".

// To use Phoenix channels, the first step is to import Socket
// and connect at the socket path in "lib/my_app/endpoint.ex":
import {Socket, Presence} from "phoenix"

import { connectSupervisor } from "./board/supervisor_connection"
import { initBoard } from "./board/board"
import { initPlayer } from "./player/player"
import { connectPlayer } from "./player/player_connection"

//let socket = new Socket("/socket", {params: {token: window.userToken}, logger: (kind, msg, data) => { console.log(`${kind}: ${msg}`, data) }} )
let socket = new Socket("/socket", {params: {token: window.userToken}} )

// let tile  = $('.tile')
let board = $("#board")

let boardChannel = undefined

if(board.length){
  boardChannel = connectSupervisor(socket)
  initBoard(boardChannel)
} else {
  boardChannel = connectPlayer(socket)
  initPlayer(boardChannel)
}

console.log(boardChannel);

// TODO split to two separate js files, one for board, one for player
// let _tiles = []
// let _matches = []
// let _connectedPlayers = []
// if( board.length === 0) {
//   window._currentPlayer = $('#current-player').data('current-player').player
//   _currentPlayer.queue = []
//   console.log(_currentPlayer);
// }
// let presences = {}
// let _tileWidth = "0%"
// let _maxTiles = 0

//TEMP as all roles are rich atm
// const BLOCKED_ROLE = "rich";
//
// const ANIMATE_IN_CLASS = "rotateInDownRight";
// const ANIMATE_OUT_CLASS = "slideOutLeft";
// const ANIMATE_MATCH_CLASS = "pulse";

// function checkBoard(){
//   let blueMatch = _.filter(_tiles, t => t === 'blue')
//   if (blueMatch.length === _maxTiles) {
//     $('.tile').removeClass('animated ' + ANIMATE_IN_CLASS)
//                .addClass('tile-set animated ' + ANIMATE_MATCH_CLASS)
//     _matches.push(_tiles)
//     _tiles = []
//     console.log( board.length );
//     window.setTimeout( ()=> { $('.tile.tile-set').remove() }, 300)
//     console.log(_tiles);
//   }
// }
//
if ( board.length ){
  // boardChannel.on("player:joined", payload => {
  //   console.log(payload);
  // })
  // boardChannel.on("player:left", payload => {
  //   console.log("player left: ", payload);
  // })
  // boardChannel.on("tile-pressed", payload => {
  //   console.log(payload);
  //   let tile = payload.tile
  //   _tiles.push(payload.tile)
  //   if(_tiles.length > _maxTiles){
  //     $('.tile.board-tile').first().addClass('will-leave')
  //     $('.tile.board-tile').first().addClass('animated ' + ANIMATE_OUT_CLASS)
  //     setTimeout(function(){
  //       $('.tile.board-tile.will-leave').remove()
  //     }, 200)
  //     _tiles.splice(0, 1)
  //   }
  //   $('.last-in').removeClass('last-in')
  //   $('.tiles').append($('<div class="tile board-tile"></div>')
  //              .addClass('tile-' + tile + ' animated ' + ANIMATE_IN_CLASS + " last-in")
  //              .css({
  //                 width: _tileWidth
  //               })
  //            )
  //
  //   checkBoard()
  // })
} else {
  //Player Specific
  // function checkPlayerBlocked (){
  //   console.log(_currentPlayer.queue.length, _maxTiles);
  //   if (_currentPlayer && _currentPlayer.role === BLOCKED_ROLE) {
  //     if(_currentPlayer.queue.length == _maxTiles) {
  //       _currentPlayer.queue = []
  //       console.log("NOT BLOCKED");
  //       $('.block-play').html(_currentPlayer.queue.length).addClass('hide')
  //     } else {
  //       console.log("BLOCKED");
  //       $('.block-play').html(_currentPlayer.queue.length).removeClass('hide')
  //     }
  //   }
  // }
  //
  // // tile.on("click", e => {
  //   console.log(e);
  //   let tile = {color: $(e.target).attr('id')}
  //   let payload = {tile: tile, player_id: _currentPlayer.id}
  //   boardChannel.push("tile-pressed", payload)
  //   //reset queue
  //   _currentPlayer.queue = []
  //   _currentPlayer.queue.push(payload)
  //   checkPlayerBlocked()
  // })
  //
  // boardChannel.on("player:joined", payload => {
  //   console.log("JOINED");
  //   console.log(payload);
  // })
  //
  // boardChannel.on("tile-pressed", payload => {
  //   if(payload.player_id !== _currentPlayer.id){
  //     _currentPlayer.queue.push(payload)
  //     $('.block-play').html(_currentPlayer.queue.length)
  //     console.log(_currentPlayer.queue.length, _maxTiles);
  //     if (_currentPlayer && _currentPlayer.role === BLOCKED_ROLE) {
  //       if(_currentPlayer.queue.length == _maxTiles) {
  //         _currentPlayer.queue = []
  //         _currentPlayer.blocked = false
  //         $('.block-play').html(_currentPlayer.queue.length).addClass('hide')
  //       }
  //     }
  //   }
  // })
}

// function renderPresence() {
//   $('#presences').html("")
//   _connectedPlayers.forEach(function(playerId){
//     $('#presences').append($(`<h2>${playerId}</h2>`))
//   })
// }
//
// function updateTileSize() {
//   $('.tile').css({
//     width: _tileWidth
//   })
// }

// function trimTiles() {
//   if($('.tile.board-tile').length > _connectedPlayers.length){
//     _tiles.splice(0, 1)
//     $('.tile.board-tile').first().remove()
//   }
// }
//
// function updateBoard () {
//   _maxTiles = _connectedPlayers.length
//   if (board.length) {
//     _tileWidth = 100 / _connectedPlayers.length + "%"
//     updateTileSize()
//     trimTiles()
//   }
// }

// if(board.length == 0){
//   boardChannel.on("presence_state", state => {
//     console.log("presence state", state);
//     presences = Presence.syncState(presences, state)
//     _connectedPlayers = Object.keys(presences)
//     renderPresence()
//     updateBoard()
//   })
//
//   boardChannel.on("presence_diff", diff => {
//     console.log("presence diff", diff);
//     presences = Presence.syncDiff(presences, diff)
//     let playerLeft = Object.keys(presences) < _connectedPlayers
//     _connectedPlayers = Object.keys(presences)
//     renderPresence()
//     updateBoard()
//   })
// }
// // boardChannel.join({token: getParameterByName("token")})
// //   .receive("ok", resp => {
// //     console.log("Joined successfully", resp)
// //    })
// //   .receive("error", resp => { console.log("Unable to join", resp) })
//
//
// function confirmExit() {
//   return "Schließt dieses Fenster nur, wenn die Lehrkraft es gesagt hat";
// }
// 

export default socket
