// NOTE: The contents of this file will only be executed if
// you uncomment its entry in "web/static/js/app.js".

// To use Phoenix channels, the first step is to import Socket
// and connect at the socket path in "lib/my_app/endpoint.ex":
import {Socket, Presence} from "phoenix"

import { connectDisplay } from "./board/display_connection"
import { initBoard } from "./board/board"
import { initPlayer } from "./player/player"
import { connectPlayer } from "./player/player_connection"

//let socket = new Socket("/socket", {params: {token: window.userToken}, logger: (kind, msg, data) => { console.log(`${kind}: ${msg}`, data) }} )
let socket = new Socket("/socket", {params: {token: window.userToken}} )

// let tile  = $('.tile')
let board = $("#board")
let player = $("#current-player")

let boardChannel = undefined

if(board.length && board.data('board').board){
  boardChannel = connectDisplay(socket)
  initBoard(boardChannel)
} else if(player.length) {
  boardChannel = connectPlayer(socket)
  initPlayer(boardChannel)
}

export default socket
