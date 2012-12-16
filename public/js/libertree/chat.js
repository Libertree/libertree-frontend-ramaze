Libertree.Chat = {

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

  // n is of type string
  updateNumUnseen: function(n) {
    if( n === '0' ) {
      $('#num-chat-unseen').hide();
    } else {
      $('#num-chat-unseen').show();
    }
    $('#num-chat-unseen').html(n);
  },

  // n is of type string
  updateNumUnseenForPartner: function(memberId, n) {
    var tab = $('#chat-window .tab[data-member-id="'+memberId+'"]');
    var indicator = tab.find('.num-chat-unseen');
    if( n === '0' ) {
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
        Libertree.Chat.updateNumUnseen(html);
        Libertree.Chat.updateNumUnseenForPartner(memberId, '0');
      }
    );
  },

  fetchConversationWith: function(memberId, andActivate) {
    if( $('#chat-window .tab[data-member-id="'+memberId+'"]').length ) {
      Libertree.Chat.activateConversation(memberId);
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
          Libertree.Chat.activateConversation(memberId);
        }
      }
    );
  },

  activateConversation: function(memberId) {
    $('#chat-window .tab, #chat-window .log').removeClass('active');
    $('#chat-window .tab[data-member-id="'+memberId+'"]').addClass('active');
    $('#chat-window .log[data-member-id="'+memberId+'"]').addClass('active');
    $('#chat-window .log.active .textarea-chat').focus();
    Libertree.Chat.syncUIDimensions()
    $('#chat-window .log.active .messages').scrollTop(999999);
  },

  receiveMessage: function(data) {
    var tab = $('#chat-window .tab[data-member-id="'+data.partnerMemberId+'"]');

    if( tab.length === 0 ) {
      Libertree.Chat.fetchConversationWith(data.partnerMemberId, false);
    }

    if( $('#chat-window').is(':visible') && tab.hasClass('active') ) {
      Libertree.Chat.markConversationSeen(data.partnerMemberId);
    } else {
      Libertree.Chat.updateNumUnseen(data.numUnseen);
      Libertree.Chat.updateNumUnseenForPartner(data.partnerMemberId, data.numUnseenForPartner);
    }

    Libertree.Chat.fetchMessage(data);
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
