export const BLOCKED_DATA = {
  'player': {
    tiles_whitelist: []
  },
  'citizen': {
    tiles_whitelist: ['blue', 'red', 'yellow', 'green']
  },
  'citizen-blue': {
    tiles_whitelist: ['blue', 'red', 'yellow', 'green'],
    message: 'Your vote has been counted, wait for the results',
    percentage_of_turns: 1,
  },
  'citizen-red': {
    tiles_whitelist: ['blue', 'red', 'yellow', 'green'],
    message: 'Your vote has been counted, wait for the results',
    percentage_of_turns: 1,
  },
  'citizen-green': {
    tiles_whitelist: ['blue', 'red', 'yellow', 'green'],
    message: 'Your vote has been counted, wait for the results',
    percentage_of_turns: 1,
  },
  'poor': {
    percentage_of_turns: 1,
    message: 'You go to work',
    tiles_whitelist: ['blue']
  },
  'middle_class': {
    percentage_of_turns: 0.75,
    message: 'You go to your office',
    tiles_whitelist: ['blue', 'yellow']
  },
  'rich': {
    percentage_of_turns: 0.5,
    message: 'You have a meeting with your finanacial planner',
    tiles_whitelist: ['blue', 'red', 'yellow', 'green']
  },
  'researcher': {
    tiles_whitelist: ['blue', 'red', 'yellow', 'green']
  },
  'breibarter': {
    tiles_whitelist: ['blue', 'red', 'yellow', 'green']
  },
};

export const BOARD_TYPE_DATA = {
  "lobby": {
    tile_ids: []
  },
  "anarchy": {
    tile_ids: ['blue', 'red', 'yellow', 'green']
  },
  "inequality": {
    tile_ids: ['blue', 'red', 'yellow', 'green']
  },
  "fake_news": {
    tile_ids: ['blue', 'red', 'yellow', 'green']
  },
  "democracy": {
    tile_ids: ['blue', 'red', 'yellow', 'green']
  }
}

let democracyTile = `<div class='achievement-tile achievement-tile-democracy' data-type='democracy'>
                      <img src='/images/special_tiles/democracy.png' />
                    </div>`
export const ACHIEVMENT_AWARDS = {
  "citizen-red": {
    tileHtml: democracyTile
  },
  "citizen-blue": {
    tileHtml: democracyTile
  },
  "citizen-green": {
    tileHtml: democracyTile
  },
  "citizen-yellow": {
    tileHtml: democracyTile
  },
  "breibarter": {
    tileHtml: `<div class='achievement-tile achievement-tile-breibarter' data-type='breibarter'>
                <img src='/images/special_tiles/breibarter.png' />
              </div>`
  }
}

export const ROLE_INTRO_DATA = {
  "breibarter": {
    img: 'breibarter.jpg',
    html: `<div class='role-intro-image'></div>
           <p><strong>Shhhh!</strong></p>
           <p>You are the publisher of BlahBart, if you convince people to
           match the colours below you will get a special tile next round...
           <span class='breibarter-colors'></span>
           </p>`
  },
  "citizen-blue": {
    img: 'citizen-blue.png',
    html: `<div class='role-intro-image'></div>
           <p><strong>Shhhh!</strong></p>
           <p>Your views align with
           <span class='ascii-tiles'><span class='ascii-tile ascii-tile-blue'>&#9632;</span></span>
           , if the most matches contain Blue this round, you will get a special tile next round...
           </p>
           `
  },
  "citizen-red": {
    img: 'citizen-red.png',
    html: `<div class='role-intro-image'></div>
           <p><strong>Shhhh!</strong></p>
           <p>Your views align with
           <span class='ascii-tiles'><span class='ascii-tile ascii-tile-red'>&#9632;</span></span>
           , if the most matches contain Red this round, you will get a special tile next round...
           </p>
           `
  },
  "citizen-green": {
    img: 'citizen-green.png',
    html: `<div class='role-intro-image'></div>
           <p><strong>Shhhh!</strong></p>
           <p>Your views align with
           <span class='ascii-tiles'><span class='ascii-tile ascii-tile-green'>&#9632;</span></span>
           , if the most matches contain Green this round, you will get a special tile next round...
           </p>
           `
  },
}

export const TILE_WIDTH = $('.tile').first().outerWidth();
export const TILE_HEIGHT = $('.tile').first().outerHeight();
export const LONG_PRESS_INTERVAL = 100
export const ESCALATE_STAGE_1_CLASS = 'pulse'
export const ESCALATE_STAGE_2_CLASS = 'pulse'

export const AFTER_PRESS_ANIMATION_TIME = 200
export const AFTER_PRESS_ANIMATION_IN_CLASS = 'zoomOut'
export const AFTER_PRESS_ANIMATION_OUT_CLASS = 'zoomIn'

export const TILE_PRESS_DEBOUNCE_DURATION = 2000
