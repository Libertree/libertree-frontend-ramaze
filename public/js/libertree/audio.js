/*jslint white: true, indent: 2 */
/*global $, Libertree, alert */

Libertree.Audio = (function () {
  "use strict";

  return {
    play: function(audioElementId) {
      if( Libertree.playAudio ) {
        document.getElementById(audioElementId).play();
      }
    },
  };
}());
