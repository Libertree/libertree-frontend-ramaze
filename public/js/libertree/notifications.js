Libertree.Notifications = {
  setState: function (notification, new_state, onSuccess) {
    var old_state = (new_state === 'seen') ? 'unseen' : 'seen';
    return function () {
      var ids = notification.data('notification-ids');
      notification.removeClass(old_state).addClass(new_state);
      /* Also toggle on Notifications page */
      $.each( ids, function(j, id) {
        $('.notification[data-notification-ids="['+id+']"]').removeClass(old_state).addClass(new_state);
      } );
      $.get('/notifications/'+new_state+'/' + ids.join('/'), function(data) {
        Libertree.Notifications.updateNumUnseen(data);
        if( onSuccess !== undefined ) {
          onSuccess();
        }
      } );
    };
  },
  // n is of type string
  updateNumUnseen: function(n) {
    var title = document.title;
    if( n === '0' ) {
      $('#num-notifications-unseen').hide();
      title = title.replace( /^\([0-9]+\) /, '' );
    } else {
      $('#num-notifications-unseen').show();
      title = title.replace( /^\([0-9]+\)/, '('+n+')' );
      if( ! title.match(/^\([0-9]+\)/) ) {
        title = '('+n+') ' + title;
      }
    }
    document.title = title;
    $('#num-notifications-unseen').text(n);
  }
};
