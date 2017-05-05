import { randomInt, spliceString } from '../utils/utils'
const HEADLINES_SPECIAL_MATCHES_FAKE_NEWS = 'green blue red'
const HEADLINES_SPECIAL_MATCHES_REAL_NEWS = 'red yellow green'
const RESEARCH_SOURCES = ['Email recieved from the editor of The Times', 'Reading cited references', 'Message recieved from a trusted friend', 'Phone conversation with head of department']
const BOARD_TYPE_EVENTS_RESPONDERS = {
  'fake_news': {
    'fake-news-published': {
      responder: respondFakeNews,
      meta: {
        headlines: [
          `<div class='j-ascii-tiles ascii-real-news'></div> Is a TRAP from the CIA!`,
          `The "Scientists" say <div class='j-ascii-tiles ascii-real-news'></div> will get you extra points`,
          `Patriot uncovers <div class='j-ascii-tiles ascii-fake-news'></div>, fight the system!`,
          `<div class='j-ascii-tiles ascii-fake-news'></div> will cure cancer`
        ],
        research_answer_texts: [
          'after vigorous testing Scientists from both Harvard, and Oxford could not reproduce the results, thus disproving the misleading article ',
          'our editors could not find any refrence to the author in state or federal records, we consider the following article fake: ',
        ]
      }
    },
    'real-news-published': {
      responder: respondRealNews,
      meta: {
        headlines: [
          `First bipartisan deal agrees on <div class='j-ascii-tiles ascii-real-news'></div>`,
          `Ancient DNA shows <div class='j-ascii-tiles ascii-real-news'></div> can aid society in it's battle against apathy`,
          `Some surprising results out of harvard show <div class='j-ascii-tiles ascii-fake-news'></div> not good for society`,
          `Large turnout to march in opposition of <div class='j-ascii-tiles ascii-fake-news'></div>`,
        ],
        research_answer_texts: [
          'citing results from the peer reviewed journals nature, and science, the head of Biology at FU Berlin agrees with us that the following article is indeed true.',
          'in an interview the week following the publication of our article, Chancelor Muggle confirmed the validity of our claims.  Read again: '
        ]
      }
    }
  }
}

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

function respondFakeNews(responseMeta, triggeredCount){
  renderNews('fake-news', responseMeta, triggeredCount)
}

function respondRealNews(responseMeta, triggeredCount){
  renderNews('real-news', responseMeta, triggeredCount)
}

export function respondBoardTypeEvent(payload) {
  let response = BOARD_TYPE_EVENTS_RESPONDERS[payload.board_type][payload.event_name]
  if(response) {
    response.responder(response.meta, payload.triggered_count)
  }
}
