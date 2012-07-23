$(document).ready( function() {
  $('#avatar-reset').live( 'click', function(event) {
    event.preventDefault();
    if( confirm('Delete your avatar and reset it to the default?') ) {
      window.location = '/profiles/avatar_reset';
    }
  } );
} );
