/* TILE MATCHING */

export const CONSIDER_GROUPED_WITHIN_MS = 1000;
export const LONG_PRESS_DURATION = 1000;
export const LONGER_PRESS_DURATION = 3000;

export const POINTS_SINGLE_COLOR = 1
export const POINTS_ALTERNATING_COLOR_POINTS = 2
export const POINTS_TIMED_TOGETHER = 4
export const POINTS_LONG_PRESS_MULTIPLIER = 3
export const POINTS_LONGER_PRESS_MULTIPLIER = 4

export const HEADLINES_SPECIAL_MATCHES_FAKE_NEWS = 'green blue red'
export const HEADLINES_SPECIAL_MATCHES_REAL_NEWS = 'red yellow green'
export const BOARD_TYPE_SPECIAL_MATCHES = {
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

/* END TILE MATCHING */
