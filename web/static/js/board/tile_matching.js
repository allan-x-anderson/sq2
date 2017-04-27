import moment from 'moment'
const CONSIDER_GROUPED_WITHIN_MS = 1000;
const LONG_PRESS_DURATION = 1000;
const LONGER_PRESS_DURATION = 3000;

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

// IDEA press durations only match if they are within the given duration range
function matchPressDuration (tiles) {
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
export function checkMatch(tiles, maxTiles){
  let matchName = null
  if(tiles.length === maxTiles){
    if( matchAllSingleColor(tiles) ) {
      matchName = "single_color_"+tiles[0].color
    } else if (matchAlternatingColors(tiles)) {
      matchName = `alternating_colors_${tiles[0].color}_${tiles[1].color}`
    } else {
      matchName = "no_match_on_color_or_pattern"
    }
    if(matchPressedWithinTimeframe(tiles)) {
      matchName = 'timed_together-' + matchName
    }
    let pressDurationMatch = matchPressDuration(tiles)
    if(pressDurationMatch) {
      matchName = `long_press_${pressDurationMatch}-` + matchName
    }
  }
  return matchName;
}
