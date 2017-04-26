import {Presence} from "phoenix"
import {createJdenticon} from "../utils/utils"
import moment from 'moment'


const ANIMATE_IN_CLASS = "slide-in-right";
const ANIMATE_OUT_CLASS = "slide-out-left";
const ANIMATE_MATCH_CLASS = "fade-out-fwd";
const ANIMATE_HERO_IN_CLASS = "bounce-in-fwd";
const ANIMATE_HERO_OUT_CLASS = "fade-out-fwd";
const ANIMATE_DOUBLE_MATCH_OUT_CLASS = "fadeOut";

const CONSIDER_GROUPED_WITHIN_MS = 1000;
const MATCH_ANIMATION_TIME = 300;
const HERO_SHOW_TIME = 1500;

const MATCH_HERO_IMAGES = {
  single_color_blue: "cute-cat",
  single_color_red: "jumping-cat",
  single_color_yellow: "adorable-cat",
  single_color_green: "grey-cat",
  alternating_colors_blue_yellow: "europe-collage",
  alternating_colors_yellow_blue: "europe-space-night"
}

function getTileWidth(numPlayers){
  return 100 / numPlayers + "%"
}

function updateTileSize(numPlayers) {
  $('#board .tile').css({
    width: getTileWidth(numPlayers)
  })
}

function checkMatch(tiles, maxTiles){
  console.log(tiles.length, maxTiles);
  if(tiles.length === maxTiles){
    let singleColorMatch = _.every(tiles, ['color', tiles[0].color])
    if( singleColorMatch ) {
      return "single_color_"+tiles[0].color
    }

    let firstColor = tiles[0].color
    let secondColor = tiles[1].color
    let oneTwoOneTwo = true
    if(firstColor != secondColor){
      _.each(tiles, (tile, idx) => {
        console.log(tile, idx, idx % 2)
        if(idx % 2 === 0) {
          if(tile.color != firstColor){
            oneTwoOneTwo = false
          }
        } else {
          if(tile.color != secondColor) {
            oneTwoOneTwo = false
          }
        }
      })
    } else {
      oneTwoOneTwo = false
    }

    if(oneTwoOneTwo == true) {
      return `alternating_colors_${firstColor}_${secondColor}`
    }
  }
}

function stripIncomingState (tiles) {
  return _.map(tiles, t => {
    if(t.state === 'incoming') {
      t.state = ''
    }
    return t
  })
}

function groupTimings(tiles) {
  let prevTile = undefined;
  let grouping = 0;
  let groupedTiles = _.each(tiles, (tile, idx) => {
    if(prevTile) {
      let prevTime = moment(prevTile.pressed_end)
      let time = moment(tile.pressed_end)
      let difference = time.diff(prevTime)
      console.log(difference);
      if(difference < CONSIDER_GROUPED_WITHIN_MS){
        prevTile.group_classes = "grouped group_" + grouping;
        tile.group_classes = "grouped group_" + grouping;
      } else {
        tile.group_classes = "group-end" + grouping;
        grouping++
      }
    }
    prevTile = tile
  })
  return groupedTiles
}

function updateBoardTiles (tile, currTiles, maxTiles) {
  let currentTiles = _.reject(currTiles, t => t.state == "outgoing")
  currentTiles = stripIncomingState(currentTiles)
  console.log(currentTiles.map(t => t.group_classes));
  tile.state = "incoming"
  let newTiles = [...currentTiles, tile]
  if(newTiles.length > maxTiles){
    let [head, ...tail] = newTiles
    head.state = "outgoing"
    newTiles = [head, ...tail]
  }
  newTiles = groupTimings(newTiles)
  return newTiles
}

function getAnimationClass(tile) {
  switch (tile.state) {
    case "match":
      return 'animated ' + ANIMATE_MATCH_CLASS
      break;
    case "incoming":
      return 'animated ' + ANIMATE_IN_CLASS
      break;
    case "outgoing":
      return 'animated ' + ANIMATE_OUT_CLASS
  }
}

function pressDurationClasses(tile) {
  if(tile.press_duration > 1000){
    return "pressed-1000"
  }
}

function renderTile(tile, maxTiles, withJendicon = false){
  let $el = $(`<div class="tile board-tile"></div>`)
  .addClass('tile-' + tile.color + " " + getAnimationClass(tile) + " " + tile.group_classes + " " + pressDurationClasses(tile))
  .css({
    width: getTileWidth(maxTiles)
  })
  if(withJendicon) {
    let jdenticonString = `<div class='tile-jdenticon'>${createJdenticon(tile.player_id.toString(), 30)}</div>`
    $el.append($(jdenticonString))
  }
  return $el
}

function renderTiles(tiles, maxTiles, containerSelector, withJendicon) {
  let tileEls = tiles.map( tile => {
    return renderTile(tile, maxTiles, withJendicon)
  })
  $(containerSelector).html(tileEls)
}

//TODO replace withJendicon with jdenticon opts that should look like {to_hash: "a tstin", size: y}
function renderMatchedTiles(tiles, maxTiles, containerSelector, alreadyFound, foundMatch, withJendicon) {
  console.log(alreadyFound, foundMatch);
  let tileEls = tiles.map( tile => {
    return renderTile(tile, maxTiles, withJendicon)
  })
  const $set = $('<div></div>').addClass('matched-tiles-set')
  $set.append(tileEls)
  $(containerSelector).prepend($set)
  if(alreadyFound && foundMatch && alreadyFound[foundMatch]){
    $set.addClass('animated ' + ANIMATE_DOUBLE_MATCH_OUT_CLASS)
    setTimeout(() => {
      $set.remove()
    }, MATCH_ANIMATION_TIME )
  }
}

function renderMatchHero(match) {
  let html = `
    <div class='match-hero'>
      <div class='match-hero-tiles'></div>
      <div class='match-hero-image'>
        <img src='/images/match_heroes/${MATCH_HERO_IMAGES[match]}.png' />
      </div>
    </div>
  `
  let $el = $(html)
  $("#match-hero").removeClass('hide')
  $el.addClass('animated ' + ANIMATE_HERO_IN_CLASS)
  $("#match-hero").append($el)
}

function removeMatchHero(opts = { immediate: false }) {
  if(opts.immediate) {
    $('.match-hero').remove()
    $("#match-hero").addClass('hide')
  } else {
    setTimeout(() => {
      $('.match-hero').addClass('animated ' + ANIMATE_HERO_OUT_CLASS)
      setTimeout(() => {
        $('.match-hero').remove()
        $("#match-hero").addClass('hide')
      }, MATCH_ANIMATION_TIME )
    }, HERO_SHOW_TIME)
  }
}

function renderStaggeredTiles(tiles, maxTiles, containerSelector) {
  $(containerSelector).html("")
  let tileEls = tiles.map( (tile, idx) => {
     setTimeout( ()=> {
       $(containerSelector).append(renderTile(tile, maxTiles))
     }, idx * 50)
  })
}

function renderPresence(connectedPlayers) {
  $('#presences').html("")
  Object.keys(connectedPlayers).forEach(function(playerId){
    $('#presences').append($(`<h2>${playerId}</h2>`))
  })
}

function trimTiles (board) {
  if(board.tiles.length > 0) {
    let sizeDifference = board.tiles.length - board.connectedPlayersCount
    console.log("SIZE DIFF", sizeDifference);
    if(sizeDifference > 0) {
      board.tiles.splice(0, sizeDifference)
      $('.tile.board-tile').length
      $('.tile.board-tile').slice(0, sizeDifference).remove()
    }
  }
}
function initListeners(channel, board) {
  channel.on("presence_state", state => {
    board.connectedPlayers = Presence.syncState(board.connectedPlayers, state)
    board.connectedPlayersCount = Object.keys(board.connectedPlayers).length
    renderPresence(board.connectedPlayers)
    updateTileSize(board.connectedPlayersCount)
    trimTiles(board)
  })

  channel.on("presence_diff", diff => {
    board.connectedPlayers = Presence.syncDiff(board.connectedPlayers, diff)
    board.connectedPlayersCount = Object.keys(board.connectedPlayers).length
    renderPresence(board.connectedPlayers)
    updateTileSize(board.connectedPlayersCount)
    trimTiles(board)
  })

  channel.on("tile-pressed", payload => {
    console.log(payload);
    let tile = payload.tile
    //TODO attach the player to the tile when they press it.
    tile.player_id = payload.player_id

    tile.press_duration = moment(tile.pressed_end).diff(moment(tile.pressed_start))
    board.tiles = updateBoardTiles(tile, board.tiles, board.connectedPlayersCount)
    let matchTiles = _.reject(board.tiles, t => t.state == "outgoing")
    let foundMatch = checkMatch(matchTiles, board.connectedPlayersCount)
    if(foundMatch){
      removeMatchHero({immediate: true});
      let matchingTiles = _.map(_.cloneDeep(matchTiles), (t) => {
        t.state = "match"
        return t
      })
      let matchedTiles = _.map(_.cloneDeep(matchTiles), (t) => {
        t.state = "matched"
        return t
      })
      renderStaggeredTiles(matchingTiles, board.connectedPlayersCount, '#board', true)

      renderMatchHero(foundMatch)
      //Is delayed
      removeMatchHero();
      renderMatchedTiles(matchedTiles, board.connectedPlayersCount, '.match-hero .match-hero-tiles', undefined, undefined, true)
      board.tiles = []
      window.setTimeout(()=> {
        renderTiles(board.tiles, board.connectedPlayersCount, '#board', true)
        renderMatchedTiles(matchedTiles, board.connectedPlayersCount, '#matches', board.matches, foundMatch)
        board.matches[foundMatch] = matchTiles
      }, MATCH_ANIMATION_TIME)

    } else {
      renderTiles(board.tiles, board.connectedPlayersCount, '#board', true)
    }
    // TODO not at all performant, it needs to only update on the new tile.
    jdenticon();
  })
}

export function initBoard(channel) {
  let initialPresences = $('#board').data('initial-presences')
  let board = {
    connectedPlayers: initialPresences,
    connectedPlayersCount: Object.keys(initialPresences).length,
    tiles: [],
    matches: {}
  }
  updateTileSize(board.connectedPlayersCount)
  initListeners(channel, board)
}
