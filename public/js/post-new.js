$(document).ready( function() {
  $(document).on('click', '#post-new input[type="submit"]', function() {
    Libertree.UI.TextAreaBackup.disable();
  } );
} );
