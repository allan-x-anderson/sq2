export const ANIMATE_IN_CLASS = "slide-in-right";
export const ANIMATE_OUT_CLASS = "slide-out-left";
export const ANIMATE_MATCH_CLASS = "fade-out-fwd";

export const ANIMATE_HERO_IN_CLASS = "bounce-in-fwd";
export const ANIMATE_HERO_IN_TIMED_TOGETHER_CLASS = "rotateIn";
export const ANIMATE_HERO_IN_LONG_PRESS_CLASS = "rollIn";
export const ANIMATE_HERO_IN_LONGER_PRESS_CLASS = "lightSpeedIn";
export const ANIMATE_HERO_OUT_CLASS = "fade-out-fwd";

export const ANIMATE_FOUND_MATCH_OUT_CLASS = "fadeOut";


export const MATCH_ANIMATION_TIME = 300;
export const HERO_SHOW_TIME = 2500;

export const MATCH_HERO_IMAGES = {
  single_color_blue: "cute-cat",
  single_color_red: "jumping-cat",
  single_color_yellow: "adorable-cat",
  single_color_green: "grey-cat",
  alternating_colors_blue_yellow: "europe-collage",
  alternating_colors_yellow_blue: "europe-space-night"
}

export const BOARD_TYPE_EVENTS = {
  'fake_news': {
    'fake-news-published': {
      every_nth_round: 4,
      starts_after_round: 4
    },
    'real-news-published': {
      every_nth_round: 8,
      starts_after_round: -6
    }
  }
}

export const RESEARCH_SOURCES = ['Email recieved from the editor of The Times', 'Reading cited references', 'Message recieved from a trusted friend', 'Phone conversation with head of department']
export const BOARD_TYPE_EVENTS_RESPONDERS = {
  'fake_news': {
    'fake-news-published': {
      meta: {
        headlines: [
          `<div class='j-ascii-tiles ascii-real-news'></div> Is a TRAP from the CIA!`,
          `The "Scientists" say <div class='j-ascii-tiles ascii-real-news'></div> will get you extra points`,
          `Patriot uncovers <div class='j-ascii-tiles ascii-fake-news'></div>, fight the system!`,
          `10 Reasons <div class='j-ascii-tiles ascii-fake-news'></div> will blow your mind`
        ],
        research_answer_texts: [
          'after vigorous testing Scientists from both Harvard, and Oxford could not reproduce the results, thus disproving the misleading article ',
          'our editors could not find any refrence to the author in state or federal records, we consider the following article fake: ',
        ]
      }
    },
    'real-news-published': {
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
