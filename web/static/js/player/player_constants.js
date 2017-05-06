export const BLOCKED_DATA = {
  'citizen': {
    tiles_whitelist: ['blue', 'red', 'yellow', 'green']
  },
  'poor': {
    percentage_of_turns: 1,
    message: 'You go to work',
    tiles_whitelist: ['blue']
  },
  'middle_class': {
    percentage_of_turns: 0.5,
    message: 'You go to your office',
    tiles_whitelist: ['blue', 'yellow']
  },
  'rich': {
    percentage_of_turns: 0.25,
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
  "anarchy": {
    tile_ids: ['blue', 'red', 'yellow', 'green']
  },
  "inequality": {
    tile_ids: ['blue', 'red', 'yellow', 'green']
  },
  "fake_news": {
    tile_ids: ['blue', 'red', 'yellow', 'green']
  },
}

export const ROLE_INTRO_DATA = {
  "breibarter": {
    img: 'breibarter.jpg',
    html: `<div class='role-intro-image'></div>
           <p><strong>Shhhh!</strong></p>
           <p>You are the publisher of BlahBart, if you convince people to
           match the colours below you will get a special tile next round...
           </p>
           <div class='breibarter-colors'></div>`
  },
}

export const DEV_DISABLE_ROLE_BLOCK = false;


export const TILE_WIDTH = $('.tile').first().outerWidth();
export const TILE_HEIGHT = $('.tile').first().outerHeight();
export const LONG_PRESS_INTERVAL = 100
export const ESCALATE_STAGE_1_CLASS = 'pulse'
export const ESCALATE_STAGE_2_CLASS = 'pulse'

export const AFTER_PRESS_ANIMATION_TIME = 200
export const AFTER_PRESS_ANIMATION_IN_CLASS = 'zoomOut'
export const AFTER_PRESS_ANIMATION_OUT_CLASS = 'zoomIn'
