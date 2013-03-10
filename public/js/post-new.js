$(document).ready( function() {
  $('#post-new input[type="submit"]').live( 'click', function() {
    Libertree.UI.TextAreaBackup.disable();
  } );
} );
