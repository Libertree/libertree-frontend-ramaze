$(document).ready( function() {
  $('a.post-new, #menu-new-post').click( function() {
    window.location = '/posts/new';
    return false;
  } );

  $('#post-new textarea').live( 'keyup',  Libertree.Posts.checkForHashtags );
  $('#post-new textarea').live( 'change', Libertree.Posts.checkForHashtags );

  $('#post-new input[type="submit"]').live( 'click', function() {
    Libertree.UI.TextAreaBackup.disable();
  } );

  if( document.URL.match(/#post-new/) ) {
    $('a.post-new, #menu-new-post').click();
  }
} );
