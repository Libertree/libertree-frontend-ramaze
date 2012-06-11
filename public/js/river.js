$(document).ready( function() {
  $('.river-tools .delete').live( 'click', function(event) {
    event.preventDefault();
    if( confirm('Delete this river?') ) {
      var river = $(this).closest('div[data-river-id]');
      window.location = '/rivers/destroy/' + river.data('river-id');
    }
    return false;
  } );
} );
