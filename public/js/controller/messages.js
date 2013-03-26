$(document).ready( function() {
  $('#toggle-new-message, a.reply, a.reply-to-all').click( function() {
    $('form#new-message').slideDown();
    return false;
  } );

  $('a.reply').click( function() {
    $('form#new-message #recipients option').prop('selected', false);
    $('form#new-message #recipients option[value="'+$('.sender').data('member-id')+'"]').prop('selected', true);
    $('select#recipients').trigger("liszt:updated");
    return false;
  } );

  $('a.reply-to-all').click( function() {
    $('form#new-message #recipients option').prop('selected', false);
    $('form#new-message #recipients option[value="'+$('.sender').data('member-id')+'"]').prop('selected', true);
    $('.recipients .recipient').each( function() {
      $('form#new-message #recipients option[value="'+$(this).data('member-id')+'"]').prop('selected', true);
    } );
    $('form#new-message #recipients option[value="'+$('form#new-message').data('member-id')+'"]').prop('selected', false);
    $('select#recipients').trigger("liszt:updated");
    return false;
  } );

  $('select#recipients').chosen();
} );
