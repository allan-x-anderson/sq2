import {Socket, Presence} from "phoenix"
import { connectToSocket, getBoardChannel, joinChannel } from '../utils/connection_utils'

export function connectAdmin(socket) {
  let boardIds = _.map($('#admin .board'), (el)=> {
    return $(el).attr("id").split("_")[1]
  })
  console.log(boardIds)
  let channels = _.map(boardIds, (boardId)=> {
    let channel = getBoardChannel(socket, boardId)
    return joinChannel(channel)
  })
  connectToSocket(socket, {is_admin: true})
  return channels
}
