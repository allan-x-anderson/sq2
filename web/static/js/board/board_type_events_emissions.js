import { BOARD_TYPE_EVENTS } from './board_constants.js'

let emittedEventCounts = {}

function willTrigger(eventsData, event, currentRound, playedTiles, connectedPlayers) {
  let oneRound = connectedPlayers
  let roundStartedAtTiles = currentRound * connectedPlayers
  let nextRoundStartsAtTiles = oneRound + currentRound * connectedPlayers
  // TODO add a flag to board type event data to show it's round based
  if (playedTiles === roundStartedAtTiles){
    console.info("HIT", )
    return currentRound > eventsData[event].starts_after_round && (currentRound - Math.abs(eventsData[event].starts_after_round)) % eventsData[event].every_nth_round === 0
  }
}

function saveTriggered(boardType, event) {
  emittedEventCounts[boardType] = emittedEventCounts[boardType] || {}
  emittedEventCounts[boardType][event] = emittedEventCounts[boardType][event] || 0
  emittedEventCounts[boardType][event]++
}

function trigger(channel, boardType, event){
  saveTriggered(boardType, event)
  let payload = {
    board_type: boardType,
    event_name: event,
    triggered_count: emittedEventCounts[boardType][event]
  }
  channel.push(event, payload)
}

export function checkBoardTypeEvents(board, channel) {
  let eventsData = BOARD_TYPE_EVENTS[board.type]
  let currentRound = Math.floor(board.total_played_tiles / board.connectedPlayersCount)
  if(eventsData) {
    _.each(Object.keys(eventsData), (event) => {
      if(willTrigger(eventsData, event, currentRound, board.total_played_tiles, board.connectedPlayersCount)) {
        trigger(channel, board.type, event)
      }
    })
  }
}
