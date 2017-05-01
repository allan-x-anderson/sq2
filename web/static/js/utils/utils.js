import SparkMD5 from 'spark-md5';

export function spliceString (str, start, deleteCount, add) {
    return str.slice(0, start) + (add || "") + str.slice(start + deleteCount);
}

export function randomInt (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
export function createJdenticon(toHash, xy) {
  return `<canvas width='${xy}' height=${xy} data-jdenticon-hash='${SparkMD5.hash(toHash)}'></canvas>`
}

export function getParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// Detect touch support ripped and stripped from modernizr
// https://github.com/Modernizr/Modernizr/blob/master/feature-detects/touchevents.js
export function deviceHasTouchEvents () {
  if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
    return true
  } else {
    return false
  }
}
