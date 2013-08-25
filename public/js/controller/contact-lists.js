$(document).ready( function() {
  $('select#contact-list-members').chosen();
  $('input#contact-list-members').select2(Libertree.UI.selectDefaults);
  $(document).on('click', '.contact-lists .delete', Libertree.UI.confirmAction);
} );
