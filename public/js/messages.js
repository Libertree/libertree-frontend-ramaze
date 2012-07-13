$(document).ready( function() {
  $('#toggle-new-message, a.reply, a.reply-to-all').click( function() {
    $('form#new-message').slideDown();
    return false;
  } );

  $('a.reply').click( function() {
    $('form#new-message #recipients option').removeAttr('selected');
    $('form#new-message #recipients option[value="'+$('.sender').data('member-id')+'"]').attr('selected','selected');
    $('select#recipients').trigger("liszt:updated");
    return false;
  } );

  $('a.reply-to-all').click( function() {
    $('form#new-message #recipients option').removeAttr('selected');
    $('form#new-message #recipients option[value="'+$('.sender').data('member-id')+'"]').attr('selected','selected');
    $('.recipients .recipient').each( function() {
      $('form#new-message #recipients option[value="'+$(this).data('member-id')+'"]').attr('selected','selected');
    } );
    $('form#new-message #recipients option[value="'+$('form#new-message').data('member-id')+'"]').removeAttr('selected');
    $('select#recipients').trigger("liszt:updated");
    return false;
  } );

  $('.message-note-toggler').click( function() {
    $('.message-note').slideToggle();
  } );

  $('select#recipients').chosen();
} );
