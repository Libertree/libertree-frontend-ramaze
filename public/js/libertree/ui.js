Libertree.UI = {
  showShowMores: function() {
    $('.excerpt').each( function() {
      if( $(this).get(0).scrollHeight > $(this).height() ) {
        $(this).siblings('.show-more').show();
      }
    } );
  },

  continuousScrollHandler: function (loader) {
    if( $(window).scrollTop() + $(window).innerHeight() >= $(document).height() - 300 ) {
      if( Libertree.PostLoader.loading || $('#no-more-posts').length ) {
        return;
      }

      $('#post-excerpts div.spinner').appendTo($('#post-excerpts'));
      Libertree.UI.addSpinner('#post-excerpts div.spinner', 'append');
      loader();
    }
  },

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
  },

  TextAreaBackup: {
    timer: undefined,
    stored: '',
    enable: function() {
      Libertree.UI.TextAreaBackup.timer = setInterval(
        Libertree.UI.TextAreaBackup.save,
        15 * 1000
      );
    },
    disable: function() {
      clearInterval(Libertree.UI.TextAreaBackup.timer);
    },
    save: function() {
      $('textarea').each( function(i) {
        var text = $(this).val()
        if( text != '' && text != Libertree.UI.TextAreaBackup.stored ) {
          Libertree.UI.TextAreaBackup.stored = text;
          $.post(
            '/textarea_save',
            {
              text: text,
              id: $(this).attr('id')
            }
          );
          return false;
        }
      } );
    }
  }
};

