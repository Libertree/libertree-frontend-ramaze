$(document).ready( function() {
  $('select#contact-list-members').chosen();
  $(document).on('click', '.contact-lists .delete', Libertree.UI.confirmAction);
} );
