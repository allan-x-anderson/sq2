import {Presence} from "phoenix"
import {deviceHasTouchEvents, createJdenticon} from "../utils/utils"
import { respondBoardTypeEvent } from "./board_type_events_responses"
import { getParameterByName } from "../utils/utils.js"

// import * as Hammer from 'hammerjs';
// window.Hammer = Hammer.default;

const BLOCKED_DATA = {
  'citizen': {
    tiles_whitelist: ['blue', 'red', 'yellow', 'green']
  },
  'poor': {
    percentage_of_turns: 1,
    message: 'You go to work',
    tiles_whitelist: ['blue']
  },
  'middle_class': {
    percentage_of_turns: 0.5,
    message: 'You go to your office',
    tiles_whitelist: ['blue', 'yellow']
  },
  'rich': {
    percentage_of_turns: 0.25,
    message: 'You have a meeting with your finanacial planner',
    tiles_whitelist: ['blue', 'red', 'yellow', 'green']
  },
};

const BOARD_TYPE_DATA = {
  "anarchy": {
    tile_ids: ['blue', 'red', 'yellow', 'green']
  },
  "inequality": {
    tile_ids: ['blue', 'red', 'yellow', 'green']
  },
  "fake_news": {
    tile_ids: ['blue', 'red', 'yellow', 'green']
  },
}

const DEV_DISABLE_ROLE_BLOCK = false;


const TILE_WIDTH = $('.tile').first().outerWidth();
const TILE_HEIGHT = $('.tile').first().outerHeight();
const LONG_PRESS_INTERVAL = 100
const ESCALATE_STAGE_1_CLASS = 'pulse'
const ESCALATE_STAGE_2_CLASS = 'pulse'

const AFTER_PRESS_ANIMATION_TIME = 200
const AFTER_PRESS_ANIMATION_IN_CLASS = 'zoomOut'
const AFTER_PRESS_ANIMATION_OUT_CLASS = 'zoomIn'

let pressStartEvent = deviceHasTouchEvents() ? 'touchstart' : 'mousedown'
let pressEndEvent = deviceHasTouchEvents() ? 'touchend' : 'mouseup'


function checkBlocked (currentPlayer, playedTiles, maxTiles){
  if(DEV_DISABLE_ROLE_BLOCK == true) {
    return false
  }
  if (currentPlayer) {
    let blockedForTurns = Math.ceil(maxTiles * BLOCKED_DATA[currentPlayer.role].percentage_of_turns)
    if(playedTiles === blockedForTurns + 1) {
      return false;
    } else {
      return true
    }
  }
}

function addJdenticon(player) {
  console.log(player.name);
  const html = `<div class='player-jdenticon'>
                  ${createJdenticon(player.name, 40)}
                </div>`
  $('body').append($(html))
  jdenticon();
}

function updateBlockedWaitTime(currentPlayer, blockedForTurns) {
  console.log(currentPlayer.queue.length, blockedForTurns);
  let message = BLOCKED_DATA[currentPlayer.role].message
  $('.block-play .blocked-image').attr('src', `images/blocked_play/${currentPlayer.role}.png`)
  $('.block-play .blocked-message-container .blocked-message').html(message)
  $('.block-play .blocked-wait-time').html(blockedForTurns + 1 - currentPlayer.queue.length)
}

function block (currentPlayer, connectedPlayersCount) {
  console.log("BLOCKED");
  $('.block-play').removeClass('hide')
  let blockedForTurns = Math.floor(connectedPlayersCount * BLOCKED_DATA[currentPlayer.role].percentage_of_turns)
  updateBlockedWaitTime(currentPlayer, blockedForTurns)
}

function unblock (currentPlayer, connectedPlayersCount) {
  console.log("NOT BLOCKED");
  $('.block-play').addClass('hide')
  let blockedForTurns = Math.floor(connectedPlayersCount * BLOCKED_DATA[currentPlayer.role].percentage_of_turns)
  updateBlockedWaitTime(currentPlayer, blockedForTurns)
}

//TODO this is duped in board
function renderPresence(connectedPlayers) {
  $('#presences').html("")
  Object.keys(connectedPlayers).forEach(function(playerId){
    $('#presences').append($(`<h2>${playerId}</h2>`))
  })
}

function absorbEvent_(event) {
  var e = event || window.event;
  e.preventDefault && e.preventDefault();
  e.stopPropagation && e.stopPropagation();
  e.cancelBubble = true;
  e.returnValue = false;
  return false;
}

function preventLongPressMenu(node) {
  node.ontouchstart = absorbEvent_;
  node.ontouchmove = absorbEvent_;
  node.ontouchend = absorbEvent_;
  node.ontouchcancel = absorbEvent_;
}

function escalateLongPress(el, pressedDuration){
  if(pressedDuration > 1000) {
    $(el).addClass('animated animated-loop');
    $(el).addClass(ESCALATE_STAGE_1_CLASS);
  }
  if (pressedDuration > 3000) {
    $(el).addClass('animated animated-loop animated-fast');
    $(el).addClass(ESCALATE_STAGE_2_CLASS);
  }
}

function deEscalateLongPress(el) {
  $(el).removeClass('animated animated-loop animated-fast')
  $(el).removeClass(ESCALATE_STAGE_1_CLASS)
  $(el).removeClass(ESCALATE_STAGE_2_CLASS)
}

function afterPressAnimation(el) {
  $(el).addClass('animated animated-after-press')
  $(el).addClass(AFTER_PRESS_ANIMATION_IN_CLASS)

  setTimeout(()=> {
    $(el).removeClass(AFTER_PRESS_ANIMATION_IN_CLASS)
    $(el).addClass(AFTER_PRESS_ANIMATION_OUT_CLASS)
  }, AFTER_PRESS_ANIMATION_TIME)

  setTimeout(()=> {
    $(el).removeClass('animated animated-after-press animated-fast')
    $(el).removeClass(AFTER_PRESS_ANIMATION_OUT_CLASS)
  }, AFTER_PRESS_ANIMATION_TIME * 2)
}

function initListeners(channel, board, currentPlayer) {
  channel.on("presence_state", state => {
    board.connectedPlayers = Presence.syncState(board.connectedPlayers, state)
    board.connectedPlayersCount = Object.keys(board.connectedPlayers).length
    renderPresence(board.connectedPlayers)
  })

  channel.on("presence_diff", diff => {
    board.connectedPlayers = Presence.syncDiff(board.connectedPlayers, diff)
    board.connectedPlayersCount = Object.keys(board.connectedPlayers).length
    renderPresence(board.connectedPlayers)
  })

  channel.on("fake-news-published", payload => {
    respondBoardTypeEvent(payload)
  })

  channel.on("real-news-published", payload => {
    respondBoardTypeEvent(payload)
  })

  channel.on("tile-pressed", payload => {
    if(payload.player.id !== currentPlayer.id){
      currentPlayer.queue.push(payload)
      let blockedForTurns = Math.floor(board.connectedPlayersCount * BLOCKED_DATA[currentPlayer.role].percentage_of_turns)
      updateBlockedWaitTime(currentPlayer, blockedForTurns)
      let shouldUnblock = !checkBlocked(currentPlayer, currentPlayer.queue.length, board.connectedPlayersCount)
      if (shouldUnblock) {
        unblock(currentPlayer, board.connectedPlayersCount)
      }
    }
  })

  $(document).on(pressStartEvent, '.tile', function(e) {
    preventLongPressMenu(e)
    //Just in case
    deEscalateLongPress($el)
    if(window.clicked){
      window.clearInterval(window.pressEscalationTimer)
    }
    let $el = $(e.target)
    let pressedFor = 0
    window.pressEscalationTimer = window.setInterval( ()=> {
      pressedFor += LONG_PRESS_INTERVAL
      escalateLongPress($el, pressedFor)
    }, LONG_PRESS_INTERVAL)
    //Reset the prev data
    $el.data('tile', '')
    let tile = {
      pressed_start: new Date(),
      color: $(e.target).attr('id')
    }
    $el.data('tile', tile)
    window.clicked = $el
  });

  $(document).on(pressEndEvent, function(e) {
    if(window.clicked){
      window.clearInterval(window.pressEscalationTimer)
      let $el = window.clicked
      deEscalateLongPress($el)
      afterPressAnimation($el)

      let tile = $el.data('tile')
      tile.pressed_end = new Date()

      let tilePlayer = _.cloneDeep(currentPlayer)
      delete tilePlayer.queue
      let payload = {tile: tile, player: tilePlayer}
      channel.push("tile-pressed", payload)

      //reset queue because they must have been able to play
      currentPlayer.queue = []
      currentPlayer.queue.push(payload)
      if(board.type === "inequality") {
        if( checkBlocked(currentPlayer, currentPlayer.queue.length, board.connectedPlayersCount) ) {
          block(currentPlayer, board.connectedPlayersCount);
        }
      }
      window.clicked = undefined
    }
  });
}

function renderTile (tile_id, isClickable) {
  let tileClass = isClickable ? 'tile' : 'dummy-tile'
  return $(`<div id="${tile_id}" class="${tileClass} tile-${tile_id}">`)
}

function isAvailableTile(currentPlayer, tile_id) {
  if (BLOCKED_DATA[currentPlayer.role] && _.includes(BLOCKED_DATA[currentPlayer.role].tiles_whitelist, tile_id)) {
    return true
  }
  return false
}

function renderPlayerTiles (currentPlayer, board) {
  let tile_ids = BOARD_TYPE_DATA[board.type].tile_ids
  let tileEls = _.map(tile_ids, (tile_id)=> {
    return renderTile(tile_id, isAvailableTile(currentPlayer, tile_id))
  })
  $('#player-hand').append(tileEls)
  console.log(tileEls);
}

function changeBoard(board_id) {

}

export function initPlayer(gameChannel, boardChannel) {
  let initialPresences = $('#current-player').data('initial-presences')
  let board = {
    connectedPlayers: initialPresences,
    connectedPlayersCount: Object.keys(initialPresences).length,
    type: $('#current-board').data('board').board.type
  }

  let currentPlayer = $('#current-player').data('current-player').player
  addJdenticon(currentPlayer)
  renderPlayerTiles(currentPlayer, board);
  currentPlayer.queue = []
  initListeners(boardChannel, board, currentPlayer)
  gameChannel.on("board:changed", payload => {
    const token = getParameterByName("token")
    window.location.replace(`/${payload.board_slug}?token=${token}&player_id=${currentPlayer.id}`)
  })
}
