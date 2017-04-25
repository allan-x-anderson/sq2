import {Presence} from "phoenix"
import * as Hammer from 'hammerjs';
window.Hammer = Hammer.default;

//POOR = blocked role atm
const BLOCKED_ROLE = "rich";
const TILE_WIDTH = $('.tile').first().outerWidth();
const TILE_HEIGHT = $('.tile').first().outerHeight();
const LONG_PRESS_INTERVAL = 100
const ESCALATE_STAGE_1_CLASS = 'pulse'
const ESCALATE_STAGE_2_CLASS = 'wobble'

const AFTER_PRESS_ANIMATION_TIME = 200
const AFTER_PRESS_ANIMATION_IN_CLASS = 'zoomOut'
const AFTER_PRESS_ANIMATION_OUT_CLASS = 'zoomIn'

function checkBlocked (currentPlayer, playedTiles, maxTiles){
  if (currentPlayer && currentPlayer.role === BLOCKED_ROLE) {
    if(playedTiles === maxTiles) {
      return false;
    } else {
      return true
    }
  }
}

function block (currentPlayer){
  console.log("BLOCKED");
  $('.block-play').html(currentPlayer.queue.length).removeClass('hide')
}

function unblock (currentPlayer){
  console.log("NOT BLOCKED");
  $('.block-play').html(currentPlayer.queue.length).addClass('hide')
}

//TODO this is duped in board
function renderPresence(connectedPlayers) {
  $('#presences').html("")
  Object.keys(connectedPlayers).forEach(function(playerId){
    $('#presences').append($(`<h2>${playerId}</h2>`))
  })
}

function pauseEvent(e){
    if(e.stopPropagation) e.stopPropagation();
    if(e.preventDefault) e.preventDefault();
    e.cancelBubble=true;
    e.returnValue=false;
    return false;
}

function escalateLongPress(el, pressedDuration){
  if(pressedDuration > 1000) {
    $(el).addClass('animated animated-loop');
    $(el).addClass(ESCALATE_STAGE_1_CLASS);
  }
  if (pressedDuration > 2000) {
    $(el).addClass(ESCALATE_STAGE_2_CLASS);
  }
}

function deEscalateLongPress(el) {
  $(el).removeClass('animated animated-loop')
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
    $(el).removeClass('animated animated-after-press')
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

  channel.on("tile-pressed", payload => {
    if(payload.player_id !== currentPlayer.id){
      currentPlayer.queue.push(payload)
      $('.block-play').html(currentPlayer.queue.length)
      let shouldUnblock = !checkBlocked(currentPlayer, currentPlayer.queue.length, board.connectedPlayersCount)
      if (shouldUnblock) {
        unblock(currentPlayer)
      }
      // if (currentPlayer && currentPlayer.role === BLOCKED_ROLE) {
      //   if(currentPlayer.queue.length == maxTiles) {
      //     currentPlayer.queue = []
      //     currentPlayer.blocked = false
      //     $('.block-play').html(currentPlayer.queue.length).addClass('hide')
      //   }
      // }
    }
  })

  _.each($('.tile'), (el)=> {
    var hammerTile = new window.Hammer.Manager(el);
    hammerTile.add(new window.Hammer.Press({time: 50, threshold: 20}))

    $(el).on('touchstart, mousedown', function(e) {
      pauseEvent(e)
      //Just in case
      deEscalateLongPress($el)
      if(window.clicked){
        window.clearInterval(window.pressEscalationTimer)

        window.clicked.css({
          width: TILE_WIDTH,
          height: TILE_HEIGHT
        })
      }
      let $el = $(e.target)
      $el.data('original-xy', {width: $el.width(), height: $el.height()})

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

  })

  $(document).on('touchend, mouseup', function(e) {
    if(window.clicked){
      window.clearInterval(window.pressEscalationTimer)

      let $el = window.clicked
      deEscalateLongPress($el)
      afterPressAnimation($el)

      let tile = $el.data('tile')
      tile.pressed_end = new Date()

      let payload = {tile: tile, player_id: currentPlayer.id}
      channel.push("tile-pressed", payload)
      //reset queue because they can play
      currentPlayer.queue = []
      currentPlayer.queue.push(payload)
      if( checkBlocked(currentPlayer, currentPlayer.queue.length, board.connectedPlayersCount) ) {
        block(currentPlayer);
      }
    }
    window.clicked = undefined
  });
}
export function initPlayer(channel) {
  let initialPresences = $('#current-player').data('initial-presences')
  let board = {
    connectedPlayers: initialPresences,
    connectedPlayersCount: Object.keys(initialPresences).length,
  }

  let currentPlayer = $('#current-player').data('current-player').player
  currentPlayer.queue = []
  initListeners(channel, board, currentPlayer)
}
