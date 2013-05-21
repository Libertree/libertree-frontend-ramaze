/*jslint white: true, indent: 2, todo: true */
/*global $, Libertree */

Libertree.UI = (function () {
  "use strict";

  var setSpeed = function(speed) {
      return function(pixels) {
        // calculate the duration to move an amount of pixels at a given speed
        return pixels * 1000 / speed;
      };
    },

    continuousScrollHandler = function (loader) {
      if( $(window).scrollTop() + $(window).innerHeight() >= $(document).height() - 300 ) {
        if( $('#no-more-posts').length ) { return; }
        loader();
      }
    };

  return {
    // speed = pixels per second
    duration: setSpeed(600),

    confirmAction: function (event) {
      if( ! confirm($(this).data('msg')) ) {
        event.preventDefault();
      }
    },

    listHandler: function (selector, url) {
      Libertree.UI.addSpinner( selector.parent(), 'append' );
      $.get( url,
        function() {
          Libertree.UI.removeSpinner( selector.parent() );
          Libertree.UI.fadingAlert( selector.data('msg') );
          selector.val('0');
          selector.trigger("liszt:updated");
        }
      );
    },

    showShowMores: function() {
      $('.excerpt').each( function() {
        if( $(this).find('.post-text').height() > $(this).find('.overflowed').height() ) {
          $(this).closest('.excerpt').siblings('.show-more').show();
        }
      } );
    },

    markdownInjector: function () {
      var $this = $(this),
        textarea = $this.closest('.markdown-injector').siblings('textarea');

      switch ($this.data('markdown')) {
      case "title":
        textarea.surroundSelectedText("\n## ", "");
        break;
      case "subtitle":
        textarea.surroundSelectedText("\n### ", "");
        break;
      case "bold":
        textarea.surroundSelectedText("**", "**");
        break;
      case "italic":
        textarea.surroundSelectedText("*", "*");
        break;
      case "strike":
        textarea.surroundSelectedText("~~", "~~");
        break;
      case "url":
        textarea.surroundSelectedText("[", "](URL)");
        break;
      case "image":
        textarea.surroundSelectedText("![IMAGE TITLE](", ")");
        break;
      case "image-link":
        textarea.surroundSelectedText("[![image/photo](", ")](URL)");
        break;
      case "quote":
        textarea.surroundSelectedText("\n\n> ", "");
        break;
      case "list":
        textarea.surroundSelectedText("\n\n* ", "");
        break;
      default:
        textarea.val( textarea.val() + $this.data('markdown') );
      }
      textarea.focus();
      return false;
    },

    hideWindows: function() {
      $('#chat-window.resizable').resizable('destroy');
      $('#chat-window').removeClass('resizable');
      $('.window').hide();
      Libertree.Chat.rememberDimensions();
    },

    //FIXME: src depends on selected theme
    addSpinner: function(target_selector, position, size) {
      //TODO: default value of "size"
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
      if ($(target).data('src') !== undefined) {
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

      if( x !== undefined && y !== undefined ) {
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

    isTouchInterface: (function() {
      return ("ontouchstart" in document.documentElement);
    }()),

    makeTextAreasExpandable: function() {
      $('textarea').not('.textarea-chat').expandable( { maxRows: 60 } );
    },

    scrollable: function() {
      /* Chromium needs us to use body, Firefox and Opera need us to use html */
      if( $('html').scrollTop() > $('body').scrollTop() ) {
        return $('html');
      }
      return $('body');
    },

    animatableNodesOnly: function(nodes) {
      var array = $.grep( nodes, function(node, i) {
        /* Ignore text nodes and other types which cannot have jQuery animations (e.g. slideDown) called on them. */
        return node.nodeType === 1;
      } );
      return $(array);
    },

    indicateNewPosts: function (data) {
      var indicator = $('#post-excerpts[data-river-id="'+data.riverId+'"] .more-posts');
      if( indicator.length ) {
        indicator.find('.load-more').text(data.numNewPosts);
        indicator.slideDown();
      }
    },

    init: function() {
      // register post loaders as continuous scroll handlers
      $(window).scroll( function() {
        continuousScrollHandler( function() {
          Libertree.PostLoader.loadFromRiver( $('#post-excerpts').data('river-id') );
          Libertree.PostLoader.loadFromPool( $('#post-excerpts').data('pool-id') );
          Libertree.PostLoader.loadFromTags( $('#post-excerpts').data('tag') );
          Libertree.PostLoader.loadFromProfile( $('#post-excerpts').data('member-id') );
        } );
      } );
    }
  };
}());

Libertree.UI.init();
