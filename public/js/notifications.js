$(document).ready( function() {
  $(document).on('click', '.notification.seen a', function(e) {
    e.stopPropagation();
  } );

  $(document).on('click', '#mark-all-notifications-seen', function(event) {
    event.preventDefault();
    $.get('/notifications/seen/all', function () {
      $('.notification').removeClass('unseen').addClass('seen');
    } );
  } );
} );
