import {Socket, Presence} from "phoenix"
import { connectToSocket, getBoardChannel, getGameChannel, joinChannel } from '../utils/connection_utils'

import { getParameterByName } from "../utils/utils.js"

const boardId = getParameterByName("board_id")
const token = getParameterByName("token")

export function connectPlayer(socket) {
  const gameId = parseInt($('#current-board').data('board').board.game_id)
  let gameChannel = getGameChannel(socket, gameId)
  joinChannel(gameChannel)

  let boardChannel = getBoardChannel(socket, boardId)
  connectToSocket(socket, {token: token})
  joinChannel(boardChannel)

  return {game_channel: gameChannel, board_channel: boardChannel}
}
