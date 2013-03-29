var _host = 'olive.libertreeproject.org';
var port = "8080";
var ws = null;
var secure = false;

$(document).ready( function() {
  var protocol = "ws://";
  if (secure) {
    protocol = "wss://";
  }
  if( 'MozWebSocket' in window ) {
    ws = new MozWebSocket(protocol + _host + ":" + port);
  } else if( 'WebSocket' in window ) {
    ws = new WebSocket(protocol + _host + ":" + port);
  } else {
    return;
  }

  ws.onopen = function(e) {
    this.send('{ "sid": "' + $.cookie('innate.sid') + '" }');
  };

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
        Libertree.Comments.insertHtmlFor( data.postId, data.commentId );
        break;
      case 'river-posts':
        Libertree.Home.indicateNewPosts(data);
        break;
      case 'notification':
        Libertree.Notifications.updateNumUnseen(data.n);
        break;
    }
  }

} );
