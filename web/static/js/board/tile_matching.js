import moment from 'moment'
import { repeatPatternUntil } from '../player/board_type_events_responses'
const CONSIDER_GROUPED_WITHIN_MS = 1000;
const LONG_PRESS_DURATION = 1000;
const LONGER_PRESS_DURATION = 3000;

const POINTS_SINGLE_COLOR = 1
const POINTS_ALTERNATING_COLOR_POINTS = 2
const POINTS_TIMED_TOGETHER = 4
const POINTS_LONG_PRESS_MULTIPLIER = 3
const POINTS_LONGER_PRESS_MULTIPLIER = 4

// TODO More reason to manage constants
// TODO Probably need 6 players to make it random enough
// TODO Think about how to make it work for anything following the pattern
// Potentially just use wording red blue green then anything
const HEADLINES_SPECIAL_MATCHES_FAKE_NEWS = 'green blue red'
const HEADLINES_SPECIAL_MATCHES_REAL_NEWS = 'red yellow green'
const BOARD_TYPE_SPECIAL_MATCHES = {
  fake_news: [
    {
      pattern: HEADLINES_SPECIAL_MATCHES_FAKE_NEWS,
      points: -100,
      name: 'special#fake_news'
    },
    {
      pattern: HEADLINES_SPECIAL_MATCHES_REAL_NEWS,
      points: 70,
      name: 'special_real_news'
    }
  ]
}

function foundPatternInColors(pattern, colorsString) {
  let regexp = new RegExp(pattern, 'i')
  return colorsString.match(regexp)
}

function checkSpecialMatches(tiles, boardType, maxTiles) {
  let specialMatchesForBoard = BOARD_TYPE_SPECIAL_MATCHES[boardType]
  console.log("SPECIAL", specialMatchesForBoard, boardType);
  if(specialMatchesForBoard){
    let tileColorsAsString = _.map(tiles, 'color').join(' ')
    let specialMatch
    let specialMatches = _.filter(specialMatchesForBoard, specialMatch => {
      console.log(tileColorsAsString, repeatPatternUntil(specialMatch.pattern, maxTiles).join(' '));
      return repeatPatternUntil(specialMatch.pattern, maxTiles).join(' ') === tileColorsAsString
    })
    if(specialMatches){
      return _.first(specialMatches)
    }
  }
}

function matchAlternatingColors (tiles) {
  let firstColor = tiles[0].color
  let secondColor = tiles[1].color
  let oneTwoOneTwo = true
  if(firstColor != secondColor){
    _.each(tiles, (tile, idx) => {
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
  return oneTwoOneTwo
}

function matchAllSingleColor (tiles) {
  return _.every(tiles, ['color', tiles[0].color])
}

export function tilesPressedWithinTimeframe(prevTile, tile){
  let prevTime = moment(prevTile.pressed_end)
  let time = moment(tile.pressed_end)
  let difference = time.diff(prevTime)
  return difference < CONSIDER_GROUPED_WITHIN_MS
}

export function matchPressDuration (tiles) {
  let longPress = _.every(tiles, function(tile) {
    return tile.press_duration > LONG_PRESS_DURATION
  })

  let longerPress = _.every(tiles, function(tile) {
    return tile.press_duration > LONGER_PRESS_DURATION
  })

  if(longPress && !longerPress) {
    return LONG_PRESS_DURATION
  } else if(longPress && longerPress) {
    return LONGER_PRESS_DURATION
  } else {
    return false
  }
}

function matchPressedWithinTimeframe (tiles) {
  let prevTile = null
  let bool = false
  _.each(tiles, function(tile) {
    if(prevTile) {
      if(tilesPressedWithinTimeframe(prevTile, tile)) {
        bool = true
      } else {
        bool = false
        return false
      }
    }
    prevTile = tile
  })
  return bool
}

// Note the - separating the below
// match_to_do_with_timing-match_to_do_with_patterns
// TODO Figure out how to strip classes for duration when the match is only on a color.
export function checkMatch(tiles, maxTiles, board){
  let matchName = null
  let points = 0
  if(tiles.length === maxTiles){
    let specialMatch = checkSpecialMatches(tiles, board.type, maxTiles)
    if ( specialMatch ) {
      matchName = specialMatch.name
      points += specialMatch.points
      // Break out early
      return {points: points, name: matchName};
    }
    if( matchAllSingleColor(tiles) ) {
      matchName = "single_color_"+tiles[0].color
      points += POINTS_SINGLE_COLOR
    } else if (matchAlternatingColors(tiles)) {
      matchName = `alternating_colors_${tiles[0].color}_${tiles[1].color}`
      points += POINTS_TIMED_TOGETHER
    } else {
      matchName = "no_match_on_color_or_pattern"
    }
    if(matchPressedWithinTimeframe(tiles)) {
      matchName = 'timed_together-' + matchName
      points += POINTS_TIMED_TOGETHER
    }
    let pressDurationMatch = matchPressDuration(tiles)
    if(pressDurationMatch) {
      if(pressDurationMatch === LONG_PRESS_DURATION) {
        matchName = `long_press-` + matchName
        points = points * POINTS_LONG_PRESS_MULTIPLIER
      } else if (pressDurationMatch === LONGER_PRESS_DURATION) {
        matchName = `longer_press-` + matchName
        points = points * POINTS_LONGER_PRESS_MULTIPLIER
      }
    }
  }
  let noColorOrPatternMatch = matchName && matchName.match(/no_match_on_color_or_pattern/i)
  if(matchName && noColorOrPatternMatch == undefined){
    return {points: points, name: matchName};
  } else {
    return false;
  }
}

export function alreadyMatched(previousMatches, foundMatchName) {
  return previousMatches && foundMatchName && previousMatches[foundMatchName]
}
