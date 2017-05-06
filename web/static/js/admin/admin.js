import {Presence} from "phoenix"

function renderConnectedPlayersCount(boardId, count){
  $('#board_'+boardId).find('.connected-players-count').text(count)
}

function initBoardListeners(channel, board) {
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

  channel.on("admin:player-joined", payload => {
    // const $el = $(`#board_${payload.player.board_id} .total-players-count`)
    // $el.html(parseInt($el.html()) + 1)
    window.location.reload()
  })
}

export function initAdmin(gameChannel, boardChannels) {
  let boards = []
  _.each(boardChannels, (channel, idx)=> {
    boards[idx] = boards[idx] || {}
    boards[idx].id = parseInt($($('#admin .board').get(idx)).attr('id').split("_")[1])
    boards[idx].connectedPlayers = {}
    boards[idx].connectedPlayersCount = 0
    initBoardListeners(channel, boards[idx])
  })
}
