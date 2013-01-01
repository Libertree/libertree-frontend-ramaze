Libertree.Notifications = {
  // n is of type string
  updateNumUnseen: function(n) {
    var title = document.title;
    if( n === '0' ) {
      $('#num-notifications-unseen').hide();
      $('#menu-notifications').addClass('none'); /* TODO: this may no longer be used, and could be removed */
      title = title.replace( /^\([0-9]+\) /, '' );
    } else {
      $('#num-notifications-unseen').show();
      $('#menu-notifications').removeClass('none'); /* TODO: this may no longer be used, and could be removed */
      title = title.replace( /^\([0-9]+\)/, '('+n+')' );
      if( ! title.match(/^\([0-9]+\)/) ) {
        title = '('+n+') ' + title;
      }
    }
    document.title = title;
    $('#num-notifications-unseen').html(n);
  }
};
