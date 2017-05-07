import { createJdenticon } from "../utils/utils"
import { randomInt } from "../utils/utils"
import { alreadyMatched } from "./tile_matching"

import {
  ANIMATE_IN_CLASS,
  ANIMATE_OUT_CLASS,
  ANIMATE_MATCH_CLASS,
  ANIMATE_HERO_IN_CLASS,
  ANIMATE_HERO_IN_TIMED_TOGETHER_CLASS,
  ANIMATE_HERO_IN_LONG_PRESS_CLASS,
  ANIMATE_HERO_IN_LONGER_PRESS_CLASS,
  ANIMATE_HERO_OUT_CLASS,
  ANIMATE_FOUND_MATCH_OUT_CLASS,
  MATCH_ANIMATION_TIME,
  HERO_SHOW_TIME,
  WELCOME_PLAYER_ANIMATION_CLASS,
  WELCOME_PLAYER_DURATION,
  MATCH_HERO_IMAGES
} from './board_constants'

// Dev util
function renderPresence(connectedPlayers) {
  $('#presences').html("")
  Object.keys(connectedPlayers).forEach(function(playerId){
    $('#presences').append($(`<h2>${playerId}</h2>`))
  })
}

// END Dev util

let _welcomedPlayers = []
function welcomePlayers(connectedPlayers, joiningPlayers){
  _.each(Object.keys(joiningPlayers), (key)=> {
    if(!_.includes(_welcomedPlayers, key)) {
      let playerName = joiningPlayers[key].metas[0].player.name
      const $joinedContainer = $('.lobby-joined-players')
      const $joiningContainer = $('.lobby-joining-players')
      const jdenticonLarge = createJdenticon(playerName, 110)
      const jdenticonSmall = createJdenticon(playerName, 40)
      const welcomeMsg = `<h2>Welcome</h2>${jdenticonLarge}`
      //Reset
      clearTimeout(window.elcomePlayer)
      $joiningContainer.removeClass(`animated ${WELCOME_PLAYER_ANIMATION_CLASS}`)
      $joiningContainer.addClass('hide')
      $joiningContainer.html('')

      //Add
      $joiningContainer.html(welcomeMsg)
      $joiningContainer.removeClass('hide')
      $joiningContainer.addClass(`animated ${WELCOME_PLAYER_ANIMATION_CLASS}`)
      $joinedContainer.append(jdenticonSmall)
      
      jdenticon()
      _welcomedPlayers.push(key)
      window.welcomePlayer = setTimeout(()=>{
        $joiningContainer.removeClass(`animated ${WELCOME_PLAYER_ANIMATION_CLASS}`)
        $joiningContainer.addClass('hide')
      }, WELCOME_PLAYER_DURATION)
    }
  })
}

function getTileWidth(numPlayers){
  return 100 / numPlayers + "%"
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

/*
  Takes an obj: {
    container_selector: '.jquery #selector',
    tiles: Array of tiles,
    max_tiles: number,
    points: number,
    previous_matches: Object of match arrays,
    found_match_name: String,
    jdenticon_opts: {
      size: number,
    }
  }
*/
function renderMatchedTiles(opts) {
  let points = opts.points || false
  let matchOnColorOrPatternOnly = opts.found_match_name && opts.found_match_name.split('-').length === 1
  let tileEls = opts.tiles.map( tile => {
    if(matchOnColorOrPatternOnly){
      delete tile.duration
      delete tile.group_classes
    }
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
    $set.addClass('animated ' + ANIMATE_FOUND_MATCH_OUT_CLASS)
    $(opts.container_selector).addClass('match-already-matched')
    setTimeout(() => {
      $(opts.container_selector).removeClass('match-already-matched')
      $set.remove()
    }, MATCH_ANIMATION_TIME )
  }
}

function getHeroAnimateInClass(match) {
  let waslongPress = match.name.split('-')[0].match(/.*_press/i)
  let timedTogether = match.name.split('-')[0] === "timed_together"
  console.log("CLASS FINDING", waslongPress, timedTogether);
  if (waslongPress) {
    if(match.name.split('-')[0] === 'long_press') {
      return ANIMATE_HERO_IN_LONG_PRESS_CLASS
    } else {
      return ANIMATE_HERO_IN_LONGER_PRESS_CLASS
    }
  }
  if(timedTogether){
    return ANIMATE_HERO_IN_TIMED_TOGETHER_CLASS
  }
  return ANIMATE_HERO_IN_CLASS
}

function renderMatchHero(match) {
  let waslongPress = match.name.split('-')[0].match(/.*_press/i)
  let timedTogether = match.name.split('-')[0] === "timed_together"
  let longPressClass = waslongPress == null ? '' : `${match.name.split('-')[0].replace('_', '-')}`
  let timedTogetherClass = timedTogether ? 'timed-together' : ''
  let matchHeroImg = function(matchName){
    let img = MATCH_HERO_IMAGES[match.name]
    if(!img){
      img = `random/${randomInt(1, 34)}`
    }
    return `<img src='/images/match_heroes/${img}.png' />`
  }
  console.log("HERO MATCH", match, waslongPress, timedTogether);
  let html = `
    <div class='match-hero ${longPressClass} ${timedTogetherClass}'>
      <div class='match-hero-tiles'></div>
      <div class='match-hero-image'>
      ${matchHeroImg(match.name)}
      </div>
    </div>
  `
  let $el = $(html)
  $("#match-hero").removeClass('hide')
  $el.addClass('animated ' + getHeroAnimateInClass(match))
  $("#match-hero").append($el)
}

function removeMatchHero(opts = { immediate: false }) {
  if(window.heroOutTimeout) {
    clearTimeout(window.heroOutTimeout)
  }
  if(opts.immediate) {
    $('.match-hero').remove()
    $("#match-hero").addClass('hide')
  } else {
    window.heroOutTimeout = setTimeout(() => {
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

function updateTileSize(numPlayers) {
  $('#board .tile').css({
    width: getTileWidth(numPlayers)
  })
}

function renderTiles(tiles, maxTiles, containerSelector, withJendicon) {
  let tileEls = tiles.map( tile => {
    return renderTile(tile, maxTiles, withJendicon)
  })
  $(containerSelector).html(tileEls)
}

export default {
  renderTiles,
  renderMatchedTiles,
  renderStaggeredTiles,
  updateTileSize,
  renderTotalPoints,
  renderMatchHero,
  removeMatchHero,
  renderPresence,
  welcomePlayers
}
