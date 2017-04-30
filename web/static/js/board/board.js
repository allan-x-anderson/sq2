import {Presence} from "phoenix"
import {checkMatch, tilesPressedWithinTimeframe} from "./tile_matching"
import { alreadyMatched } from "./tile_matching"
import boardRenderer from "./board_rendering"
import moment from 'moment'

// FIXME This is duplicated, look into how to manage constants in js
const MATCH_ANIMATION_TIME = 300;

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
    boardRenderer.renderPresence(board.connectedPlayers)
    boardRenderer.updateTileSize(board.connectedPlayersCount)
    trimTiles(board)
  })

  channel.on("presence_diff", diff => {
    board.connectedPlayers = Presence.syncDiff(board.connectedPlayers, diff)
    board.connectedPlayersCount = Object.keys(board.connectedPlayers).length
    boardRenderer.renderPresence(board.connectedPlayers)
    boardRenderer.updateTileSize(board.connectedPlayersCount)
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
      boardRenderer.removeMatchHero({immediate: true});

      let matchingTiles = _.map(_.cloneDeep(matchTiles), (t) => {
        t.state = "match"
        return t
      })

      let matchedTiles = _.map(_.cloneDeep(matchTiles), (t) => {
        t.state = "matched"
        return t
      })

      //The animation on play area
      boardRenderer.renderStaggeredTiles(matchingTiles, board.connectedPlayersCount, '#board', true)

      boardRenderer.renderMatchHero(foundMatch)
      //Is delayed
      boardRenderer.removeMatchHero();
      let HeroTilesOpts = {
        container_selector: '.match-hero .match-hero-tiles',
        tiles: matchedTiles,
        max_tiles: board.connectedPlayersCount,
        points: foundMatch.points,
        jdenticon_opts: {
          size: '20',
        }
      }

      boardRenderer.renderMatchedTiles(HeroTilesOpts)
      if(!alreadyMatched(board.matches, foundMatch.name)){
        board.points = board.points + foundMatch.points
        boardRenderer.renderTotalPoints(board.points)
      }

      board.tiles = []
      window.setTimeout(()=> {
        boardRenderer.renderTiles(board.tiles, board.connectedPlayersCount, '#board', true)
        let matchesTilesOpts = {
          container_selector: '#matches',
          tiles: matchedTiles,
          max_tiles: board.connectedPlayersCount,
          previous_matches: board.matches,
          found_match_name: foundMatch.name,
          points: foundMatch.points
        }
        boardRenderer.renderMatchedTiles(matchesTilesOpts)
        board.matches[foundMatch.name] = matchTiles
      }, MATCH_ANIMATION_TIME)

    } else {
      boardRenderer.renderTiles(board.tiles, board.connectedPlayersCount, '#board', true)
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
  boardRenderer.updateTileSize(board.connectedPlayersCount)
  boardRenderer.renderTotalPoints(board.points)
  initListeners(channel, board)
}
