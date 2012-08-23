$(document).ready( function() {
  $('.river-tools .delete').live( 'click', function(event) {
    event.preventDefault();
    if( confirm($(this).data('msg')) ) {
      var river = $(this).closest('div[data-river-id]');
      window.location = '/rivers/destroy/' + river.data('river-id');
    }
  } );
} );
