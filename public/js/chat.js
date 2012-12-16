$(document).ready( function() {
  $('#menu-chat').click( function() {
    if( $('#chat-window').is(':visible') ) {
      Libertree.UI.hideWindows();
      return false;
    }

    Libertree.UI.hideWindows();
    $('#chat-window').empty();
    Libertree.UI.addSpinner('#chat-window', 'append');
    $('#chat-window')
      .show()
      .load(
        '/chat/_index',
        function(html) {
          Libertree.Session.ensureAlive(html);
          Libertree.UI.removeSpinner('#chat-window');
          $('#chat-window').hide();
          var o = $(html);
          Libertree.Chat.markConversationSeen( o.find('.log.active').data('member-id') );

          $('#chat-window')
            .resizable( {
              minHeight: 170,
              resize: function(event, ui) {
                Libertree.Chat.syncUIDimensions();
              },
              stop: function(event, ui) {
                Libertree.Chat.rememberDimensions();
              }
            } )
          ;

          $('select#chat-new-partner').chosen().change( function() {
            var memberId = $('select#chat-new-partner').val();
            Libertree.Chat.fetchConversationWith(memberId, true);
            $('select#chat-new-partner').val('0');
            $('select#chat-new-partner').trigger("liszt:updated");
            return false;
          } );

          Libertree.Chat.syncUIDimensions();
          $('#chat-window').show();
          $('#chat-window .log .messages').scrollTop(999999);
          $('#chat-window .log.active .textarea-chat').focus();
        }
      )
    ;
    Libertree.Chat.rememberDimensions();

    return false;
  } );

  $('#chat-window .tab').live( 'click', function() {
    var memberId = $(this).data('member-id');
    Libertree.Chat.activateConversation(memberId);
    Libertree.Chat.markConversationSeen(memberId);
  } );

  $('#chat-window .textarea-chat').live( 'keydown', function(event) {
    if( event.keyCode != 13 ) {
      return;
    }

    var textarea = $(this);

    textarea.attr('disabled', 'disabled');
    Libertree.UI.TextAreaBackup.disable();
    var memberId = $(this).closest('.log').data('member-id');

    $.post(
      '/chat/create',
      {
        to_member_id: memberId,
        text: textarea.val()
      },
      function(response) {
        var h = $.parseJSON(response);
        if( h.success ) {
          textarea.val('');
        } else {
          alert('Failed to send chat message.');
        }
        textarea.removeAttr('disabled');
      }
    );
  } );

  $('#chat-window .tab .close').live( 'click', function() {
    var tab = $(this).closest('.tab');
    var memberId = tab.data('member-id');
    var tabToActivate = tab.next();
    if( tabToActivate.length === 0 ) {
      tabToActivate = tab.prev();
    }
    $('#chat-window .tab[data-member-id="'+memberId+'"]').remove();
    $('#chat-window .log[data-member-id="'+memberId+'"]').remove();
    $.get('/chat/closed/'+memberId);
    if( $('#chat-window .tab.active').length === 0 && tabToActivate.length ) {
      Libertree.Chat.activateConversation( tabToActivate.data('member-id') );
    }
    return false;
  } );

  $('#chat-window').draggable( {
    handle: '.header',
    stop: function(event, ui) {
      Libertree.Chat.rememberDimensions();
    }
  } );

  $('#online-contacts .avatar').live( 'click', function() {
    Libertree.Chat.fetchConversationWith( $(this).data('member-id'), true);
    return false;
  } );

  /* ------------------------------------------------------ */

  $.cookie('chat-width', $.cookie('chat-width') || 400);
  $.cookie('chat-height', $.cookie('chat-height') || 400);
  $('#chat-window').css( {
    top: $.cookie('chat-top'),
    left: $.cookie('chat-left'),
    width: $.cookie('chat-width'),
    height: $.cookie('chat-height'),
  } );
  if( $.cookie('chat-open') === 'true' ) {
    $('#menu-chat').click();
  }

  setInterval( Libertree.Chat.heartbeat, 3 * 60 * 1000 );
} );
