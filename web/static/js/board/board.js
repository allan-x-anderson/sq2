import { Presence } from "phoenix"
import { MATCH_ANIMATION_TIME, BOARD_TYPE_INFOS } from './board_constants'
import { checkMatch, tilesPressedWithinTimeframe, matchPressDuration, matchPressedWithinTimeframe } from "./tile_matching"
import { alreadyMatched } from "./tile_matching"
import { checkBoardTypeEvents } from "./board_type_events_emissions"
import { percentageOfVotesPerTile, setVoteBarWidths, voteResults, renderResult } from "./board_types/democracy"
import { createJdenticon } from "../utils/utils"
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

function unblockPlayers (channel) {
  console.log("PUSHING EVENT");
  channel.push('voting:round-finished', {})
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
    if(board.type == "lobby"){
      boardRenderer.welcomePlayers(board.connectedPlayers, diff.joins)
    }
  })

  channel.on('achievements:tile-pressed', ({tile: tile}) => {
    let $carEl = $(`<div class="special-tile-flare sweep-right">${createJdenticon(tile.player.name, 50)}<img src='/images/special_tiles/${tile.type}.png'/></div>`)
    $('body').append($carEl)
    jdenticon()
    window.carAnimationTimeout = setTimeout(()=> {
      $carEl.remove()
    }, 7000)
    console.log(tile)
  })

  channel.on('matches:new-match', ({match: match}) => {
    const $el = $('.game-bar-points')
    let points = $el.data('points')
    $el.find('.game-bar-points-number').html(points + match.points)
    $el.data('points', points + match.points)
    $('.board-infos').addClass('hide')
  })

  channel.on("tile-pressed", payload => {
    let tile = payload.tile
    board.total_played_tiles++
    checkBoardTypeEvents(board, channel)

    tile.player = payload.player
    tile.press_duration = moment(tile.pressed_end).diff(moment(tile.pressed_start))

    if(board.type === 'democracy') {
      board.votes.push(tile)
      const tileColors = ['red', 'blue', 'yellow', 'green'];

      let votePercentages = percentageOfVotesPerTile(tileColors, board.votes, board.connectedPlayersCount)
      setVoteBarWidths(votePercentages)
      if(board.votes.length == board.connectedPlayersCount){
        let winningTile = voteResults(votePercentages, board)
        console.log("WINNER WINNER", winningTile);
        if(winningTile){
          renderResult(winningTile, votePercentages, tileColors)
          unblockPlayers(channel)
          tile = winningTile
        } else {
          renderResult(winningTile, votePercentages, tileColors)
          unblockPlayers(channel)
          return false
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
        //removeMatchHero delayed
        boardRenderer.removeMatchHero();
        let match = {
          points: foundMatch.points,
          name: foundMatch.name,
          tiles: _.map(matchedTiles, 'color')
        }
        channel.push('matches:new-match', {match: match})
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
        boardRenderer.renderTiles(board.tiles, board.connectedPlayersCount, '#board', {jdenticon_opts: { size: '20' } })

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
      boardRenderer.renderTiles(board.tiles, board.connectedPlayersCount, '#board', {jdenticon_opts: { size: '20' } })
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
    points: $('#board').data('board').board.points
  }

  boardRenderer.updateTileSize(board.connectedPlayersCount)
  boardRenderer.renderTotalPoints(board.points)

  if (BOARD_TYPE_INFOS[board.type]) {
    const $el = $('.board-infos')
    $el.removeClass('hide')
    $el.html(BOARD_TYPE_INFOS[board.type].html)
  }
  
  initListeners(boardChannel, board)
  gameChannel.on("board:changed", payload => {
    window.location.replace(`/boards/${payload.board_slug}`)
  })
}
