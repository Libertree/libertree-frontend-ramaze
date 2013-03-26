$(document).ready( function() {
  $('#menu-notifications').click( function() {
    if( $('#notifications-window').is(':visible') ) {
      Libertree.UI.hideWindows();
      return false;
    }

    if( $('#num-notifications-unseen').text() === '0' ) {
      window.location = '/notifications';
      return false;
    }

    Libertree.UI.hideWindows();
    $('#notifications-window').empty();
    Libertree.UI.addSpinner('#notifications-window', 'append');
    $('#notifications-window').
      load(
        '/notifications/_index',
        function(html) {
          Libertree.Session.ensureAlive(html);
          Libertree.UI.removeSpinner('#notifications-window');
          Libertree.Notifications.updateNumUnseen( $(html).find('.n').text() );
        }
      ).
      toggle()
    ;
    return false;
  } );

  $(document).on('click', '.notification a', function(e) {
    e.stopPropagation();
  } );

  $(document).on('click', '.notification.unseen', function() {
    var ids = $(this).data('notification-ids');
    $(this).removeClass('unseen').addClass('seen');
    /* Also toggle on Notifications page */
    $.each( ids, function(j, id) {
      $('.notification[data-notification-ids="['+id+']"]').removeClass('unseen').addClass('seen');
    } );
    $.get('/notifications/seen/' + ids.join('/'), function(data) {
      Libertree.Notifications.updateNumUnseen(data);
    } );
  } );

  $(document).on('click', '.notification.seen', function() {
    var ids = $(this).data('notification-ids');
    $(this).removeClass('seen').addClass('unseen');
    /* Also toggle on Notifications page */
    $.each( ids, function(j, id) {
      $('.notification[data-notification-ids="['+id+']"]').removeClass('seen').addClass('unseen');
    } );
    $.get('/notifications/unseen/' + ids.join('/'), function(data) {
      Libertree.Notifications.updateNumUnseen(data);
    } );
  } );

  $(document).on('click', '#mark-all-notifications-seen', function(event) {
    event.preventDefault();
    $.get('/notifications/seen/all', function () {
      $('.notification')
        .removeClass('unseen')
        .addClass('seen')
      ;
      Libertree.Notifications.updateNumUnseen('0');
    } );
  } );

  /* Cover up occasional inconsistency in backend code */
  Libertree.Notifications.updateNumUnseen( $('#num-notifications-unseen').text() );
} );
