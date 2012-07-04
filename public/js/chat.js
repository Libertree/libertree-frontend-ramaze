function fetchChatMessage(chatMessage) {
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
}

function updateNumChatUnseen(n) {
  if( n == 0 ) {
    $('#num-chat-unseen').hide();
  } else {
    $('#num-chat-unseen').show();
  }
  $('#num-chat-unseen').html(n);
}

function markChatConversationSeen(memberId) {
  $.get(
    '/chat/seen/'+memberId,
    function(html) {
      updateNumChatUnseen(html);
    }
  );
}

function fetchChatConversationWith(memberId) {
  $('#chat-window .active').removeClass('active');
  $.get(
    '/chat/_tab/'+memberId+'/active',
    function(html) {
      $(html).appendTo('#chat-window .tabs');
    }
  );
  $.get(
    '/chat/_log/'+memberId+'/active',
    function(html) {
      var o = $(html);
      o.appendTo('#chat-window .logs');
      o.find('.messages').scrollTop(999999);
      o.find('.textarea-chat').focus();
    }
  );
}

$(document).ready( function() {
  $('#menu-chat').click( function() {
    if( $('#chat-window').is(':visible') ) {
      hideWindows();
      return false;
    }

    hideWindows();
    $('#chat-window').empty();
    addSpinner('#chat-window');
    $('#chat-window').
      load(
        '/chat/_index',
        function(html) {
          checkForSessionDeath(html);
          removeSpinner('#chat-window');
          $('select#chat-new-partner').chosen().change( function() {
            fetchChatConversationWith( $('select#chat-new-partner').val() );
            return false;
          } );
          $('#chat-window .log .messages').scrollTop(999999);
          var o = $(html);
          markChatConversationSeen( o.find('.log.active').data('member-id') );
          $('#chat-window .log.active .textarea-chat').focus();
        }
      ).
      toggle()
    ;
    return false;
  } );

  /* Hack because Chosen isn't working as advertised re: data-placeholder */
  $('#chat_new_partner_chzn').live( 'click', function() {
    $('select#chat-new-partner').find('option[value="0"]').remove();
    $('select#chat-new-partner').trigger("liszt:updated");
  } );

  $('#chat-window .tab').live( 'click', function() {
    var memberId = $(this).data('member-id');
    $('#chat-window .tab, #chat-window .log').removeClass('active');
    $('#chat-window .tab[data-member-id="'+memberId+'"]').addClass('active');
    $('#chat-window .log[data-member-id="'+memberId+'"]').addClass('active');
    markChatConversationSeen(memberId);
    $('#chat-window .log.active .textarea-chat').focus();
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
} );
