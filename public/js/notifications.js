/* TODO: Is this file still needed? */

$(document).ready( function() {
  $(document).on('click', '.notification.seen a', function(e) {
    e.stopPropagation();
  } );
} );
