Libertree.Notifications = {
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
    $('#num-notifications-unseen').html(n);
  }
};
