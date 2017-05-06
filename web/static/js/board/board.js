import { Presence } from "phoenix"
import { MATCH_ANIMATION_TIME } from './board_constants'
import { checkMatch, tilesPressedWithinTimeframe, matchPressDuration, matchPressedWithinTimeframe } from "./tile_matching"
import { alreadyMatched } from "./tile_matching"
import { checkBoardTypeEvents } from "./board_type_events_emissions"
import boardRenderer from "./board_rendering"
import moment from 'moment'


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
    let tile = payload.tile
    board.total_played_tiles++
    checkBoardTypeEvents(board, channel)

    tile.player = payload.player
    tile.press_duration = moment(tile.pressed_end).diff(moment(tile.pressed_start))

    if(board.type === 'democracy') {
      tile.state = 'vote'
      board.votes.push(tile)
      let votePercentages = _.map(['red', 'blue', 'yellow', 'green'], color => {
        let tilesOfColor = _.filter(board.votes, (t) => { return t.color === color }).length
        let percentageOfTotal = tilesOfColor / board.connectedPlayersCount * 100
        return {color: color, percentage_of_votes: percentageOfTotal}
      })
      let voteBarEls = _.map(votePercentages, (item) => {
        return `<div class="vote-percentage vote-percentage-${item.color}" style="width: ${item.percentage_of_votes}%"></div>`
      })
      // TODO update the css only so it can transition.
      console.log($('#votes .votes-bar'));
      $('#votes .votes-bar').html(voteBarEls)
      console.log(votePercentages);
      if(board.votes.length == board.connectedPlayersCount){
        let max = _.maxBy(votePercentages, 'percentage_of_votes')
        console.log(max);
        let isTied = _.filter(votePercentages, (v) => {
          console.log(v.percentage_of_votes, max.percentage_of_votes);
          return v.percentage_of_votes === max.percentage_of_votes}).length > 1
        if(isTied){
          console.log("WAS A TIE");
          board.votes = []
          return false
        } else {
          tile.color = max.color
          tile.player = {name: "Democratic vote"}
          board.votes = []
        }
      } else {
        return false
      }
    }
    board.tiles = updateBoardTiles(tile, board.tiles, board.connectedPlayersCount)
    let matchTiles = _.reject(board.tiles, t => t.state == "outgoing")
    let foundMatch = checkMatch(matchTiles, board.connectedPlayersCount, board)
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

      if(!alreadyMatched(board.matches, foundMatch.name)){
        boardRenderer.renderMatchHero(foundMatch)
        //Is delayed
        boardRenderer.removeMatchHero();
      }

      let HeroTilesOpts = {
        container_selector: '.match-hero .match-hero-tiles',
        tiles: matchedTiles,
        found_match_name: foundMatch.name,
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

export function initBoard(gameChannel, boardChannel) {
  let initialPresences = $('#board').data('initial-presences')
  console.log($('#board').data('board'));
  let board = {
    connectedPlayers: initialPresences,
    connectedPlayersCount: Object.keys(initialPresences).length,
    tiles: [],
    votes: [],
    total_played_tiles: 0,
    matches: {},
    roles: $('#board').data('board').board.roles,
    type: $('#board').data('board').board.type,
    points: 0
  }

  boardRenderer.updateTileSize(board.connectedPlayersCount)
  boardRenderer.renderTotalPoints(board.points)
  initListeners(boardChannel, board)
  gameChannel.on("board:changed", payload => {
    window.location.replace(`/boards/${payload.board_slug}`)
  })
}
