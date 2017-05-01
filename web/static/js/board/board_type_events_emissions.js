const BOARD_TYPE_EVENTS = {
  'fake_news': {
    'fake-news-published': {
      every_nth_round: 4,
      starts_after_round: 0
    },
    'real-news-published': {
      every_nth_round: 8,
      starts_after_round: 6
    }
  }
}

let emittedEventCounts = {}

function willTrigger(eventsData, event, currentRound) {
  return currentRound > eventsData[event].starts_after_round && (currentRound - eventsData[event].starts_after_round) % eventsData[event].every_nth_round === 0
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
  console.log("TRIGGERING", event, payload);
  channel.push(event, payload)
}

export function checkBoardTypeEvents(board, channel) {
  let eventsData = BOARD_TYPE_EVENTS[board.type]
  let currentRound = Math.floor(board.total_played_tiles / board.connectedPlayersCount)
  console.log("Round", currentRound);
  if(eventsData) {
    _.each(Object.keys(eventsData), (event) => {
      if(willTrigger(eventsData, event, currentRound)) {
        trigger(channel, board.type, event)
      }
    })
  }
}
