import {Socket, Presence} from "phoenix"
import { connectToSocket, getBoardChannel, getGameChannel, joinChannel } from '../utils/connection_utils'

export function connectDisplay(socket) {
  let board = $("#board")

  const gameId = parseInt(board.data('board').board.game_id)
  let gameChannel = getGameChannel(socket, gameId)
  joinChannel(gameChannel)

  const boardId = parseInt(board.data('board').board.id)
  let boardChannel = getBoardChannel(socket, boardId)
  joinChannel(boardChannel)

  connectToSocket(socket, {is_display: true})
  return {game_channel: gameChannel, board_channel: boardChannel}
}
