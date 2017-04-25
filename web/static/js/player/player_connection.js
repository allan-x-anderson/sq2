import {Socket, Presence} from "phoenix"
import { connectToSocket, getBoardChannel, joinChannel } from '../utils/connection_utils'

import { getParameterByName } from "../utils/utils.js"

const boardId = getParameterByName("board_id")
const token = getParameterByName("token")

export function connectPlayer(socket) {
  let channel = getBoardChannel(socket, boardId)
  connectToSocket(socket, {token: token})
  return joinChannel(channel)
}
