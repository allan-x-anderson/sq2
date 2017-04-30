import {Presence} from "phoenix"
import {createJdenticon} from "../utils/utils"
import {checkMatch, tilesPressedWithinTimeframe} from "./tile_matching"
import moment from 'moment'


const ANIMATE_IN_CLASS = "slide-in-right";
const ANIMATE_OUT_CLASS = "slide-out-left";
const ANIMATE_MATCH_CLASS = "fade-out-fwd";
const ANIMATE_HERO_IN_CLASS = "bounce-in-fwd";
const ANIMATE_HERO_OUT_CLASS = "fade-out-fwd";
const ANIMATE_DOUBLE_MATCH_OUT_CLASS = "fadeOut";


const MATCH_ANIMATION_TIME = 300;
const HERO_SHOW_TIME = 2500;

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
      if(tilesPressedWithinTimeframe(prevTile, tile)){
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
  if(tile.press_duration > 3000){
    return "longer-press"
  } else if(tile.press_duration > 1000){
    return "long-press"
  }
}

function renderTile(tile, maxTiles, jdenticonOpts = false){
  let $el = $(`<div class="tile board-tile"></div>`)
  .addClass('tile-' + tile.color + " " + getAnimationClass(tile) + " " + tile.group_classes + " " + pressDurationClasses(tile))
  .css({
    width: getTileWidth(maxTiles)
  })
  if(!_.isEmpty(jdenticonOpts)) {
    let jdenticonString = `<div class='tile-jdenticon'>${createJdenticon(tile.player.name, jdenticonOpts.size)}</div>`
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

function alreadyMatched(previousMatches, foundMatchName) {
  return previousMatches && foundMatchName && previousMatches[foundMatchName]
}

function renderMatchedTiles(opts) {
  let points = opts.points || false
  let tileEls = opts.tiles.map( tile => {
    return renderTile(tile, opts.max_tiles, opts.jdenticon_opts)
  })
  const $set = $('<div></div>').addClass('matched-tiles-set')
  if(points){
    $set.prepend($(`<div class="match-points">${points}</div>`))
    $set.append($('<div class="match-tiles"></div>').append(tileEls))
  } else {
    $set.append(tileEls)
  }
  $(opts.container_selector).prepend($set)
  if(alreadyMatched(opts.previous_matches, opts.found_match_name)){
    $set.addClass('animated ' + ANIMATE_DOUBLE_MATCH_OUT_CLASS)
    setTimeout(() => {
      $set.remove()
    }, MATCH_ANIMATION_TIME )
  }
}

function renderMatchHero(match) {
  console.log("HERO MATCH", match);
  let waslongPress = match.name.split('-')[0].match(/long[az]_press-/i)
  let timedTogether = match.name.split('-')[0] === "timed_together"
  let longPressClass = waslongPress == null ? '' : `${match.name.split('-')[0]}`
  let timedTogetherClass = timedTogether ? 'timed-together' : ''
  let html = `
    <div class='match-hero ${longPressClass} ${timedTogetherClass}'>
      <div class='match-hero-tiles'></div>
      <div class='match-hero-image'>
        <img src='/images/match_heroes/${MATCH_HERO_IMAGES[match.name]}.png' />
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

function renderTotalPoints(totalPoints) {
  $('#points .total-points').html(totalPoints)
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
    console.log("Tile pressed board", payload);
    let tile = payload.tile

    //TODO attach the player to the tile when they press it.
    tile.player = payload.player
    tile.press_duration = moment(tile.pressed_end).diff(moment(tile.pressed_start))

    board.tiles = updateBoardTiles(tile, board.tiles, board.connectedPlayersCount)
    let matchTiles = _.reject(board.tiles, t => t.state == "outgoing")
    let foundMatch = checkMatch(matchTiles, board.connectedPlayersCount)
    if(foundMatch){
      //Clear previous hero
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
      let HeroTilesOpts = {
        container_selector: '.match-hero .match-hero-tiles',
        tiles: matchedTiles,
        max_tiles: board.connectedPlayersCount,
        points: foundMatch.points,
        jdenticon_opts: {
          size: '20',
        }
      }

      renderMatchedTiles(HeroTilesOpts)
      if(!alreadyMatched(board.matches, foundMatch.name)){
        board.points = board.points + foundMatch.points
        renderTotalPoints(board.points)
      }

      board.tiles = []
      window.setTimeout(()=> {
        renderTiles(board.tiles, board.connectedPlayersCount, '#board', true)
        let matchesTilesOpts = {
          container_selector: '#matches',
          tiles: matchedTiles,
          max_tiles: board.connectedPlayersCount,
          previous_matches: board.matches,
          found_match_name: foundMatch.name,
          points: foundMatch.points
        }
        renderMatchedTiles(matchesTilesOpts)
        board.matches[foundMatch.name] = matchTiles
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
    matches: {},
    points: 0
  }
  updateTileSize(board.connectedPlayersCount)
  renderTotalPoints(board.points)
  initListeners(channel, board)
}
