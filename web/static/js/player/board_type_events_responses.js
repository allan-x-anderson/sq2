import { randomInt, spliceString } from '../utils/utils'
import {
  RESEARCH_SOURCES,
  BOARD_TYPE_EVENTS_RESPONDERS,
} from '../board/board_constants'

import {
  HEADLINES_SPECIAL_MATCHES_FAKE_NEWS,
  HEADLINES_SPECIAL_MATCHES_REAL_NEWS,
} from '../constants'

let lorem = new Lorem;

export function repeatPatternUntil (pattern, length) {
  let patternAry = pattern.split(' ')
  let repeatedPattern = []
  for (var i = 0; i < length; i++) {
    repeatedPattern.push(patternAry[i % (patternAry.length)])
  }
  return repeatedPattern
};

function generateAsciiTiles(tileColorsArray) {
  return _.map(tileColorsArray, (color)=> {
    return `<span class='ascii-tile ascii-tile-${color}'>&#9632;</span>`
  })
}

export function fillAsciiTilesDivs(startPattern, playersCount){
  let $el = $('.j-ascii-tiles')
  if( $el.hasClass('ascii-fake-news') ) {
    startPattern = HEADLINES_SPECIAL_MATCHES_FAKE_NEWS
  } else if ( $el.hasClass('ascii-real-news') ){
    startPattern = HEADLINES_SPECIAL_MATCHES_REAL_NEWS
  } else {
    console.error('TMP should have class', $el)
  }
  let asciiTilesArray = repeatPatternUntil(startPattern, playersCount)
  let asciiTilesHtml = generateAsciiTiles(asciiTilesArray).join('')
  $('.j-ascii-tiles').html($(asciiTilesHtml))
}

function generateResearch(researchClicksCount, resultShowsAfter, resultText){
  let researchParagraphs = $(lorem.createText(randomInt(2, 6), 1));
  let randomParagraphIdx = randomInt(0, researchParagraphs.length - 1)
  if(researchClicksCount > resultShowsAfter){
    let randomParagraph = researchParagraphs.get(randomParagraphIdx);
    let randomInsertionPoint = randomInt(2, $(randomParagraph).html().split(' ').length - 1)
    let paragraphWithInsertedInfo = $(randomParagraph).html().split(' ')
    paragraphWithInsertedInfo.splice(randomInsertionPoint, 0, "<strong>", resultText, "</strong>")
    $(researchParagraphs.get(randomParagraphIdx)).html(paragraphWithInsertedInfo.join(' '));
  }
  $(researchParagraphs).first().prepend($(`<h1>${_.sample(RESEARCH_SOURCES)}</h1>`))
  return researchParagraphs
}

function renderNews(type, responseMeta, triggeredCount){
  let currentPlayer = $('#current-player').data('current-player').player
  let $el = $('.modal-news')
  let researchClicksCount = 0;
  let resultShowsAfter = randomInt(2, 5);
  $el.removeClass('hide')
  console.log(responseMeta, triggeredCount);
  $el.find('.modal-content h1').html(responseMeta.headlines[triggeredCount - 1])
  $el.find('.modal-content .article-lorem').html($(lorem.createText(2, 1)))


  $el.find('.j-button-close').on('click', ()=> {
    $el.addClass('hide')
    $el.find('.modal-news-research').addClass('hide')
    $el.find('.modal-news-summary').removeClass('hide')
    $el.find('.j-button-research').off('click')
    $el.find('.j-button-close').off('click')
    $(window).scrollTop();
  })

  if(currentPlayer.role !== 'researcher') {
    $el.find('.j-button-research').addClass('hide')
  } else {
    $el.find('.j-button-research').on('click', ()=> {
      researchClicksCount++
      $el.find('.modal-news-summary').addClass('hide')
      $el.animate({ scrollTop: 0 }, "fast");
      $el.find('.modal-news-research').removeClass('hide')
      let answerText = _.sample(responseMeta.research_answer_texts) + responseMeta.headlines[triggeredCount - 1]
      let researchParagraphs = generateResearch(researchClicksCount, resultShowsAfter, answerText)
      $el.find('.modal-news-research .modal-research-text').html(researchParagraphs)
      fillAsciiTilesDivs(undefined, $('#connected-players-count').data('count'))
    })
  }
  fillAsciiTilesDivs(undefined, $('#connected-players-count').data('count'))
}

export function respondBoardTypeEvent(payload) {
  let response = BOARD_TYPE_EVENTS_RESPONDERS[payload.board_type][payload.event_name]
  if (response) {
    if (payload.board_type == 'fake_news') {
      if (payload.event_name == 'fake-news-published') {
        renderNews('fake-news', response.meta, payload.triggered_count)
      } else if (payload.event_name == 'real-news-published'){
        renderNews('real-news', response.meta, payload.triggered_count)
      } else {
        console.error("No event matches for board_type: fake_news on", payload.event_name)
      }
    }
  }
}
