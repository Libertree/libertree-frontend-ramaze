Libertree.UI = {
  setSpeed: function(speed) {
    return function(pixels) {
      // calculate the duration to move an amount of pixels at a given speed
      return pixels * 1000 / speed;
    };
  },

  showShowMores: function() {
    $('.excerpt').each( function() {
      if( $(this).find('.post-text').height() > $(this).find('.overflowed').height() ) {
        $(this).closest('.excerpt').siblings('.show-more').show();
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

  //FIXME: src depends on selected theme
  enableIconSpinner: function(target) {
    target.data('src', $(target).attr('src'));
    target.attr('src', "/themes/default/images/icon-spinner.gif");
  },
  disableIconSpinner: function(target) {
    if ($(target).data('src') != undefined) {
      target.attr('src', $(target).data('src'));
      target.removeAttr('data-src');
    }
  },

  //TRANSLATEME
  updateAges: function() {
    $('.age').each( function(i) {
      if( $(this).text().match(/^seconds ago$/) ) {
        $(this).text('1 minute ago');
      } else {
        var m = $(this).text().match(/^(\d+) minutes? ago$/);
        if( m ) {
          $(this).text( (parseInt(m[1], 10) + 1) + ' minutes ago');
        }
      }
    } );
  },

  // TODO: replace with bootstrap popover
  fadingAlert: function(message, x, y) {
    var div = $('<div class="fading-alert has-shadow">'+message+'</div>');
    div.appendTo('body');

    if( ! ( typeof x === 'undefined' || typeof y === 'undefined' ) ) {
      div.css( { left: x+'px', top: y+'px' } );
    }
    setTimeout(
      function() {
        $('.fading-alert').fadeOut(2000);
      },
      1000 + message.length * 50
    );
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
        var text = $(this).val();
        if( text !== '' && text !== Libertree.UI.TextAreaBackup.stored ) {
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
  },

  isTouchInterface: function() {
    return ("ontouchstart" in document.documentElement);
  },

  makeTextAreasExpandable: function() {
    $('textarea').not('.textarea-chat').expandable( { maxRows: 60 } );
  },

  scrollable: function() {
    /* Chromium needs us to use body, Firefox and Opera need us to use html */
    var htmlScrollTop = $('html').scrollTop();
    var bodyScrollTop = $('body').scrollTop();
    if( htmlScrollTop > bodyScrollTop ) {
      return $('html');
    } else {
      return $('body');
    }
  }
};

// speed = pixels per second
Libertree.UI.duration = Libertree.UI.setSpeed(600);
