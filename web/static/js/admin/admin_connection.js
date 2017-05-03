import {Socket, Presence} from "phoenix"
import { connectToSocket, getBoardChannel, getGameChannel, joinChannel } from '../utils/connection_utils'

function boardChannels(socket) {
  let boardIds = _.map($('#admin .board'), (el)=> {
    return $(el).attr('id').split('_')[1]
  })

  let channels = _.map(boardIds, (boardId)=> {
    let channel = getBoardChannel(socket, boardId)
    return joinChannel(channel)
  })
  return channels
}

export function connectAdmin(socket) {
  const gameId = $('#admin').data('game-id')

  let gameChannel = getGameChannel(socket, gameId)
  joinChannel(gameChannel)

  let channels = boardChannels(socket)

  connectToSocket(socket, {is_admin: true})
  return {game_channel: gameChannel, board_channels: channels}
}
