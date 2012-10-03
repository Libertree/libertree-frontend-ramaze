Libertree.Chat = {
  var that = this;

  fetchMessage: function(chatMessage) {
    var messages = $('#chat-window .log[data-member-id="'+chatMessage.partnerMemberId+'"] .messages');
    $.get(
      '/chat/_message/' + chatMessage.id,
      function(html) {
        var o = $(html);
        o.appendTo(messages);
        var height = o.height();
        var animationDuration = height*5;
        o.hide().slideDown(animationDuration);

        messages.animate(
          { scrollTop: messages.scrollTop() + height + 30 },
          animationDuration
        );
      }
    );
  },

  updateNumUnseen: function(n) {
    if( n == 0 ) {
      $('#num-chat-unseen').hide();
    } else {
      $('#num-chat-unseen').show();
    }
    $('#num-chat-unseen').html(n);
  },

  updateNumUnseenForPartner: (memberId, n) {
    var tab = $('#chat-window .tab[data-member-id="'+memberId+'"]');
    var indicator = tab.find('.num-chat-unseen');
    if( n == 0 ) {
      indicator.hide();
    } else {
      indicator.show();
    }
    indicator.html(n);
  },

  markConversationSeen: function(memberId) {
    $.get(
      '/chat/seen/'+memberId,
      function(html) {
        that.updateNumUnseen(html);
        that.updateNumUnseenForPartner(memberId, 0);
      }
    );
  },

  fetchConversationWith: function(memberId, andActivate) {
    if( $('#chat-window .tab[data-member-id="'+memberId+'"]').length ) {
      that.activateConversation(memberId);
      return false;
    }

    $.get(
      '/chat/_tab/'+memberId,
      function(html) {
        $(html).appendTo('#chat-window .tabs');
      }
    );
    $.get(
      '/chat/_log/'+memberId,
      function(html) {
        var o = $(html);
        o.appendTo('#chat-window .logs');
        o.find('.messages').scrollTop(999999);
        o.find('.textarea-chat').focus();
        if( andActivate ) {
          that.activateConversation(memberId);
        }
      }
    );
  },

  activateConversation: function(memberId) {
    $('#chat-window .tab, #chat-window .log').removeClass('active');
    $('#chat-window .tab[data-member-id="'+memberId+'"]').addClass('active');
    $('#chat-window .log[data-member-id="'+memberId+'"]').addClass('active');
    $('#chat-window .log.active .textarea-chat').focus();
    that.syncUIDimensions()
    $('#chat-window .log.active .messages').scrollTop(999999);
  },

  receiveMessage: (data) {
    var tab = $('#chat-window .tab[data-member-id="'+data.partnerMemberId+'"]');

    if( tab.length == 0 ) {
      that.fetchConversationWith(data.partnerMemberId, false);
    }

    if( $('#chat-window').is(':visible') && tab.hasClass('active') ) {
      that.markConversationSeen(data.partnerMemberId);
    } else {
      that.updateNumUnseen(data.numUnseen);
      that.updateNumUnseenForPartner(data.partnerMemberId, data.numUnseenForPartner);
    }

    that.fetchMessage(data);
  },

  syncUIDimensions: function() {
    $('#chat-window .log.active .messages').height(
      $('#chat-window').height() - 200
    );
    $('#chat_new_partner_chzn').width(
      $('#chat-window').width() - 10
    );
  },

  rememberDimensions: function() {
    $.cookie( 'chat-top', $('#chat-window').css('top') );
    $.cookie( 'chat-left', $('#chat-window').css('left') );
    $.cookie( 'chat-width', $('#chat-window').css('width') );
    $.cookie( 'chat-height', $('#chat-window').css('height') );
    $.cookie( 'chat-open', $('#chat-window').is(':visible') );
  },

  heartbeat: function() {
    $.get('/accounts/heartbeat');
  },
};

/* ---------------------------------------------------------------------------- */

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
          checkForSessionDeath(html);
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
    clearInterval(timerSaveTextAreas);
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
    if( tabToActivate.length == 0 ) {
      tabToActivate = tab.prev();
    }
    $('#chat-window .tab[data-member-id="'+memberId+'"]').remove();
    $('#chat-window .log[data-member-id="'+memberId+'"]').remove();
    $.get('/chat/closed/'+memberId);
    if( $('#chat-window .tab.active').length == 0 && tabToActivate.length ) {
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
  if( $.cookie('chat-open') == 'true' ) {
    $('#menu-chat').click();
  }

  setInterval( Libertree.Chat.heartbeat, 3 * 60 * 1000 );
} );
