var host = null;
var ws = null;

function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1,c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}

$(document).ready( function() {
  if( 'MozWebSocket' in window ) {
    ws = new MozWebSocket("ws://" + host + ":8080");
  } else if( 'WebSocket' in window ) {
    ws = new WebSocket("ws://" + host + ":8080");
  } else {
    return;
  }

  ws.onopen = function(e) {
    this.send('{ "sid": "' + getCookie('innate.sid') + '" }');
  }

  ws.onmessage = function(e) {
    var data = $.parseJSON(e.data);

    switch( data.command ) {
      case 'heartbeat':
        /* Do nothing on heartbeat.  Heartbeats seem to increase/ensure websocket feature reliability. */
        /* $('html').append('<!-- heartbeat: '+data.timestamp+' -->'); */
        break;
      case 'chat-message':
        receiveChatMessage(data);
        break;
      case 'comment':
        insertCommentHtmlFor( data.postId, data.commentId );
        break;
      case 'post':
        /* TODO */
        break;
      case 'notification':
        updateNumNotificationsUnseen(data.n);
        break;
    }
  }

} );
