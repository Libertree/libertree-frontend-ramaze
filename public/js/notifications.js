// n is of type string
function updateNumNotificationsUnseen(n) {
  var title = document.title;
  if( n === '0' ) {
    $('#num-notifications-unseen').hide();
    $('#menu-notifications').addClass('none'); /* this may no longer be used, and could be removed */
    title = title.replace( /^\([0-9]+\) /, '' );
  } else {
    $('#num-notifications-unseen').show();
    $('#menu-notifications').removeClass('none'); /* this may no longer be used, and could be removed */
    title = title.replace( /^\([0-9]+\)/, '('+n+')' );
    if( ! title.match(/^\([0-9]+\)/) ) {
      title = '('+n+') ' + title;
    }
  }
  document.title = title;
  $('#num-notifications-unseen').html(n);
}

$(document).ready( function() {
  $('#menu-notifications').click( function() {
    if( $('#notifications-window').is(':visible') ) {
      Libertree.UI.hideWindows();
      return false;
    }

    if( $('#num-notifications-unseen').text() === '0' ) {
      window.location = '/notifications'
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
    var ids = $(this).data('notification-ids');
    $(this).removeClass('unseen').addClass('seen');
    /* Also toggle on Notifications page */
    $.each( ids, function(j, id) {
      $('.notification[data-notification-ids="['+id+']"]').removeClass('unseen').addClass('seen');
    } );
    $.get('/notifications/seen/' + ids.join('/'), function(data) {
      updateNumNotificationsUnseen(data);
    } );
  } );

  $('.notification.seen').live( 'click', function() {
    var ids = $(this).data('notification-ids');
    $(this).removeClass('seen').addClass('unseen');
    /* Also toggle on Notifications page */
    $.each( ids, function(j, id) {
      $('.notification[data-notification-ids="['+id+']"]').removeClass('seen').addClass('unseen');
    } );
    $.get('/notifications/unseen/' + ids.join('/'), function(data) {
      updateNumNotificationsUnseen(data);
    } );
  } );

  $('#mark-all-notifications-seen').live( 'click', function(event) {
    event.preventDefault();
    $.get('/notifications/seen/all', function () {
      $('.notification')
        .removeClass('unseen')
        .addClass('seen')
      ;
      updateNumNotificationsUnseen('0');
    } );
  } );

  /* Cover up occasional inconsistency in backend code */
  updateNumNotificationsUnseen( $('#num-notifications-unseen').text() );
} );
