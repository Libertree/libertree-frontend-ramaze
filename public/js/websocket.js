var host = null;
var ws = null;
var secure = false;

$(document).ready( function() {
  var protocol = "ws://";
  if (secure) {
    protocol = "wss://";
  }
  if( 'MozWebSocket' in window ) {
    ws = new MozWebSocket(protocol + host + ":8080");
  } else if( 'WebSocket' in window ) {
    ws = new WebSocket(protocol + host + ":8080");
  } else {
    return;
  }

  ws.onopen = function(e) {
    this.send('{ "sid": "' + $.cookie('innate.sid') + '" }');
  }

  ws.onmessage = function(e) {
    var data = $.parseJSON(e.data);

    switch( data.command ) {
      case 'heartbeat':
        /* Do nothing on heartbeat.  Heartbeats seem to increase/ensure websocket feature reliability. */
        /* $('html').append('<!-- heartbeat: '+data.timestamp+' -->'); */
        break;
      case 'chat-message':
        Libertree.Chat.receiveMessage(data);
        break;
      case 'comment':
        insertCommentHtmlFor( data.postId, data.commentId );
        break;
      case 'river-posts':
        indicateNewPosts(data);
        break;
      case 'notification':
        updateNumNotificationsUnseen(data.n);
        break;
    }
  }

} );
