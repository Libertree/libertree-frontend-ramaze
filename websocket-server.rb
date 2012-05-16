require 'syck'
require 'json'
require 'em-websocket'
require 'libertree/model'

$conf = Syck.load( File.read("#{ File.dirname( __FILE__ ) }/config/application.yaml") )
$sockets = Hash.new

def onmessage(ws, data)
  sid = data['sid']
  session_account = Libertree::Model::SessionAccount[sid: sid]
  if session_account.nil?
    puts "Unrecognized session: #{sid}"
    return
  end

  $sockets[sid] = {
    ws: ws,
    account: session_account.account,
    last_post_id: Libertree::DB.dbh.sc("SELECT MAX(id) FROM posts"),
    last_notification_id: Libertree::DB.dbh.sc("SELECT MAX(id) FROM notifications WHERE account_id = ?", session_account.account.id),
  }
end

EventMachine.run do
  EventMachine::WebSocket.start(:host => $conf['websocket_listen_host'], :port => 8080) do |ws|
    ws.onopen do
    end

    ws.onclose do
      $sockets.delete_if { |k,v| v[:ws] == ws }
    end

    ws.onmessage do |json_data|
      begin
        onmessage ws, JSON.parse(json_data)
      rescue Exception => e
        $stderr.puts e.message + "\n" + e.backtrace.join("\n\t")
      end
    end
  end

  EventMachine.add_periodic_timer(2) do
    $sockets.each do |sid,s|
      account = s[:account]
      ws = s[:ws]

      posts = Libertree::Model::Post.s("SELECT * FROM posts WHERE id > ? ORDER BY id LIMIT 1", s[:last_post_id])
      posts.each do |post|
        ws.send(
          {
            'command'   => 'post',
            'id'        => post.id,
            'river_ids' => post.rivers_belonged_to.map { |r| r.id }
          }.to_json
        )
        s[:last_post_id] = post.id
      end

      notifs = Libertree::Model::Notification.s("SELECT * FROM notifications WHERE id > ? AND account_id = ? ORDER BY id LIMIT 1", s[:last_notification_id], s[:account].id)
      notifs.each do |n|
        ws.send(
          {
            'command' => 'notification',
            'id' => n.id,
            'n' => s[:account].num_notifications_unseen
          }.to_json
        )
        s[:last_notification_id] = n.id
      end
    end
  end
end
