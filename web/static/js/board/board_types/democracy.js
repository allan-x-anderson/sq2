import { SHOW_VOTE_RESULT_DURATION } from '../board_constants'

export function percentageOfVotesPerTile(tileColors, votes, connectedPlayersCount) {
  return _.map(tileColors, color => {
    let tilesOfColor = _.filter(votes, (t) => { return t.color === color }).length
    let percentageOfTotal = tilesOfColor / connectedPlayersCount * 100
    return {color: color, percentage_of_votes: percentageOfTotal}
  })
}

export function setVoteBarWidths(votePercentages) {
  _.each(votePercentages, (item) => {
    $(`.votes-bar .vote-percentage-${item.color}`).css({width: item.percentage_of_votes + '%'})
  })
}

function clearVotesBar(tileColors) {
  const emptyBarPercentages = _.map(tileColors, color => {
    return {color: color, percentage_of_votes: 0}
  })
  setVoteBarWidths(emptyBarPercentages)
}

export function renderResult(winningTile, votePercentages, tileColors) {
  const $resultEl = $('#votes .votes-bar-result')
  if (winningTile) {
    let wonWithPercent = _.find(votePercentages, (vp)=> {
      console.log(winningTile, vp);
      return vp.color === winningTile.color
    }).percentage_of_votes
    $resultEl.html(`<h2>${winningTile.color} wins with ${wonWithPercent.toFixed(2)}% of the Votes!</h2>`)
  } else {
    $resultEl.html(`<h2>It was an equal split vote not passed.</h2>`)
  }
  window.setTimeout(()=> {
    clearVotesBar(tileColors)
    $resultEl.html(`<p>Voting in progress...</p>`)
  }, SHOW_VOTE_RESULT_DURATION)
}

export function voteResults(votePercentages, board){
  let max = _.maxBy(votePercentages, 'percentage_of_votes')
  let isTied = _.filter(votePercentages, (v) => {
    return v.percentage_of_votes === max.percentage_of_votes}
  ).length > 1
  console.log("TIED?", isTied);
  if(isTied){
    board.votes = []
    return undefined
  } else {
    board.votes = []
    let winningTile = {
      color: max.color,
      player: {
        name: "DEMOCRATIC VOTE",
        board_id: 4
      },
    }
    return winningTile
  }
}
