$(document).ready( function() {
  $('#post-new textarea').live( 'keyup',  Libertree.Posts.checkForHashtags );
  $('#post-new textarea').live( 'change', Libertree.Posts.checkForHashtags );

  $('#post-new input[type="submit"]').live( 'click', function() {
    Libertree.UI.TextAreaBackup.disable();
  } );
} );
