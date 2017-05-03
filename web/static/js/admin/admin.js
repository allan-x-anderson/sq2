import {Presence} from "phoenix"

function renderConnectedPlayersCount(boardId, count){
  $('#board_'+boardId).find('.connected-players-count').text(count)
}

function initListeners(channel, board) {
  console.log(board);
  channel.on("presence_state", state => {
    board.connectedPlayers = Presence.syncState(board.connectedPlayers, state)
    board.connectedPlayersCount = Object.keys(board.connectedPlayers).length
    renderConnectedPlayersCount(board.id, board.connectedPlayersCount)
  })

  channel.on("presence_diff", diff => {
    board.connectedPlayers = Presence.syncDiff(board.connectedPlayers, diff)
    board.connectedPlayersCount = Object.keys(board.connectedPlayers).length
    renderConnectedPlayersCount(board.id, board.connectedPlayersCount)
  })
}

export function initAdmin(channels) {
  let boards = []
  _.each(channels, (channel, idx)=> {
    boards[idx] = boards[idx] || {}
    boards[idx].id = parseInt($($('#admin .board').get(idx)).attr('id').split("_")[1])
    boards[idx].connectedPlayers = {}
    boards[idx].connectedPlayersCount = 0
    initListeners(channel, boards[idx])
  })
}
