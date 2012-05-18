function updateNumNotificationsUnseen(n) {
  var title = $('head title').text();
  if( n == 0 ) {
    $('#num-notifications-unseen').hide();
    $('#menu-notifications').addClass('none');
    title = title.replace( /^\([0-9]+\) /, '' );
  } else {
    $('#num-notifications-unseen').show();
    $('#menu-notifications').removeClass('none');
    title = title.replace( /^\([0-9]+\)/, '('+n+')' );
    if( ! title.match(/^\([0-9]+\)/) ) {
      title = '('+n+') ' + title;
    }
  }
  $('head title').text(title);
  $('#num-notifications-unseen').html(n);
}

$(document).ready( function() {
  $('#menu-notifications').click( function() {
    if( $('#notifications-window').is(':visible') ) {
      hideWindows();
      return false;
    }

    if( $('#num-notifications-unseen').text() == '0' ) {
      window.location = '/notifications'
      return false;
    }

    hideWindows();
    $('#notifications-window').empty();
    addSpinner('#notifications-window');
    $('#notifications-window').
      load(
        '/notifications/_index',
        function(html) {
          checkForSessionDeath(html);
          removeSpinner('#notifications-window');
          updateNumNotificationsUnseen( $(html).find('.n').text() );
        }
      ).
      toggle()
    ;
    return false;
  } );

  $('.notification a').live( 'click', function(e) {
    e.stopPropagation();
  } );

  $('.notification.unseen').live( 'click', function() {
    var id = $(this).data('notification-id');
    $('.notification[data-notification-id="'+id+'"]')
      .removeClass('unseen')
      .addClass('seen')
    ;
    $.get('/notifications/seen/' + id, function(data) {
      updateNumNotificationsUnseen(data);
    } );
  } );

  $('.notification.seen').live( 'click', function() {
    var id = $(this).data('notification-id');
    $('.notification[data-notification-id="'+id+'"]')
      .removeClass('seen')
      .addClass('unseen')
    ;
    $.get('/notifications/unseen/' + id, function(data) {
      updateNumNotificationsUnseen(data);
    } );
  } );

  $('#mark-all-notifications-seen').live( 'click', function() {
    $.get('/notifications/seen/all', function () {
      $('.notification')
        .removeClass('unseen')
        .addClass('seen')
      ;
      updateNumNotificationsUnseen(0);
    } );
  } );

  /* Cover up occasional inconsistency in backend code */
  updateNumNotificationsUnseen( $('#num-notifications-unseen').text() );
} );
