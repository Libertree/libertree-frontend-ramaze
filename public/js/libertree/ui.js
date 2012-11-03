Libertree.UI = {
  hideWindows: function() {
    $('#chat-window').resizable('destroy');
    $('.window').hide();
    Libertree.Chat.rememberDimensions();
  },

  //FIXME: src depends on selected theme
  addSpinner: function(target_selector, position, size) {
    $(target_selector)[position]('<img class="spinner size-'+size+'" src="/themes/default/images/spinner.gif"/>');
  },

  removeSpinner: function(target_selector) {
    $('img.spinner', target_selector).remove();
  },

  //TRANSLATEME
  updateAges: function() {
    $('.age').each( function(i) {
      if( $(this).text().match(/^seconds ago$/) ) {
        $(this).text('1 minute ago');
      } else {
        var m = $(this).text().match(/^(\d+) minutes? ago$/);
        if( m ) {
          $(this).text( (parseInt(m[1]) + 1) + ' minutes ago');
        }
      }
    } );
  }
};

