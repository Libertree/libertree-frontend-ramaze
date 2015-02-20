/*jslint white: true, indent: 2 */
/*global $, Libertree, alert */

Libertree.Audio = (function () {
  "use strict";

  return {
    play: function(selector) {
      if( Libertree.playAudio ) {
        $(selector).get(0).play();
      }
    },
  };
}());
