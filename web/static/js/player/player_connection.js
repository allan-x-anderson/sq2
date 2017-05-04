import {Socket, Presence} from "phoenix"
import { connectToSocket, getBoardChannel, getGameChannel, joinChannel } from '../utils/connection_utils'

import { getParameterByName } from "../utils/utils.js"


export function connectPlayer(socket) {
  const token = getParameterByName("token")
  const gameId = parseInt($('#current-board').data('board').board.game_id)
  const boardId = parseInt($('#current-board').data('board').board.id)
  let gameChannel = getGameChannel(socket, gameId)
  joinChannel(gameChannel)

  let boardChannel = getBoardChannel(socket, boardId)
  connectToSocket(socket, {token: token})
  joinChannel(boardChannel)

  return {game_channel: gameChannel, board_channel: boardChannel}
}
