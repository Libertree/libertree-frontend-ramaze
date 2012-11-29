var timerCheckForHashtags;

function checkForHashtags() {
  if( $('#post-new textarea').val().match(/#[a-zA-Z0-9_-]/) ) {
    $('#hashtags-input').hide();
  } else {
    $('#hashtags-input').show();
  }
}

$(document).ready( function() {
  $('a.post-new, #menu-new-post').click( function() {
    window.location = '/posts/new';
    return false;
  } );

  $('#post-new textarea').live( 'keyup', function() {
    clearTimeout(timerCheckForHashtags);
    timerCheckForHashtags = setTimeout( checkForHashtags, 500 );
  } );
  $('#post-new textarea').live( 'change', function() {
    clearTimeout(timerCheckForHashtags);
    timerCheckForHashtags = setTimeout( checkForHashtags, 500 );
  } );

  $('#post-new input[type="submit"]').live( 'click', function() {
    Libertree.UI.TextAreaBackup.disable();
  } );

  if( document.URL.match(/#post-new/) ) {
    $('a.post-new, #menu-new-post').click();
  }
} );
