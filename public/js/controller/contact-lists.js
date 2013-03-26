$(document).ready( function() {
  $('select#contact-list-members').chosen();

  $(document).on('click', '.contact-lists .delete', function(event) {
    event.preventDefault();
    if( confirm($(this).data('msg')) ) {
      var contact_list = $(this).closest('li[data-contact-list-id]');
      window.location = '/contact-lists/destroy/' + contact_list.data('contact-list-id');
    }
  } );
} );
