$(document).ready( function() {
  $('select#contact-list-members').chosen();

  $(document).on('click', '.contact-lists .delete', function(event) {
    if( ! confirm($(this).data('msg')) ) {
      event.preventDefault();
    }
  } );
} );
