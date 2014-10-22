$(document).ready( function() {
  $(document).on('click', '.notification.seen a', function(e) {
    e.stopPropagation();
  } );

  $(document).on('click', '.notification.unseen', Libertree.Notifications.setState('seen') );
  $(document).on('click', '.notification.seen', Libertree.Notifications.setState('unseen') );

  $(document).on('click', '#mark-all-notifications-seen', function(event) {
    event.preventDefault();
    $.get('/notifications/seen/all', function () {
      $('.notification').removeClass('unseen').addClass('seen');
      Libertree.Notifications.notificationsSyncer.n = '0';
    } );
  } );
} );
