import {Socket, Presence} from "phoenix"
import { connectToSocket, getBoardChannel, joinChannel } from '../utils/connection_utils'

export function connectDisplay(socket) {
  let board = $("#board")
  const boardId = parseInt(board.data('board').board.id)
  let channel = getBoardChannel(socket, boardId)
  connectToSocket(socket, {is_display: true})
  return joinChannel(channel)
}
