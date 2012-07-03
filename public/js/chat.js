function receiveChatMessage(cm) {
  alert(cm.text);
}

function switchToOrCreateChatConversationWith(member_id) {

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
          $('select#chat-new-partner').chosen();
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
} );
