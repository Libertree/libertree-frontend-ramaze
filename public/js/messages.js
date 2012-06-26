$(document).ready( function() {
  $('#toggle-new-message').click( function() {
    $('form#new-message').slideToggle();
  } );

  $('select.enhanced').chosen();
} );
