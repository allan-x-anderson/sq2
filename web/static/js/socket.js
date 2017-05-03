// NOTE: The contents of this file will only be executed if
// you uncomment its entry in "web/static/js/app.js".

// To use Phoenix channels, the first step is to import Socket
// and connect at the socket path in "lib/my_app/endpoint.ex":
import {Socket, Presence} from "phoenix"

import { connectDisplay } from "./board/display_connection"
import { initBoard } from "./board/board"
import { initPlayer } from "./player/player"
import { initAdmin } from "./admin/admin"
import { connectPlayer } from "./player/player_connection"
import { connectAdmin } from "./admin/admin_connection"

//let socket = new Socket("/socket", {params: {token: window.userToken}, logger: (kind, msg, data) => { console.log(`${kind}: ${msg}`, data) }} )
let socket = new Socket("/socket", {params: {token: window.userToken}} )

// let tile  = $('.tile')
let admin = $("#admin")
let board = $("#board")
let player = $("#current-player")

let boardChannel
let gameChannel
let adminBoardChannels

if(board.length && board.data('board').board){
  let {game_channel: gameChannel,
      board_channel: boardChannel}
        = connectDisplay(socket)
  initBoard(gameChannel, boardChannel)
} else if(player.length) {
  let {game_channel: gameChannel,
      board_channel: boardChannel}
       = connectPlayer(socket)
  initPlayer(gameChannel, boardChannel)
} else if(admin.length) {
  let {game_channel: gameChannel,
      board_channels: adminBoardChannels}
        = connectAdmin(socket)
  initAdmin(gameChannel, adminBoardChannels)
}


export default socket
