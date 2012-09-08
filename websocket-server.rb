require 'syck'
require 'json'
require 'em-websocket'
require 'libertree/model'

$conf = Syck.load( File.read("#{ File.dirname( __FILE__ ) }/config/application.yaml") )
$sessions = Hash.new

pid_dir = File.join( File.dirname(__FILE__), 'pids' )
if ! Dir.exists?(pid_dir)
  Dir.mkdir pid_dir
end
pid_file = File.join(pid_dir, 'websocket-server.pid')
File.open(pid_file, 'w') do |f|
  f.print Process.pid
end

puts "Starting websocket server (pid #{Process.pid})..."

def onmessage(ws, data)
  sid = data['sid']
  session_account = Libertree::Model::SessionAccount[sid: sid]
  if session_account.nil?
    puts "Unrecognized session: #{sid}"
    return
  end

  $sessions[sid] ||= {
    sockets: Hash.new,
    account: session_account.account,
  }
  $sessions[sid][:sockets][ws] ||= {
    last_post_id: Libertree::DB.dbh.sc("SELECT MAX(id) FROM posts"),
    last_notification_id: Libertree::DB.dbh.sc("SELECT MAX(id) FROM notifications WHERE account_id = ?", session_account.account.id),
    last_comment_id: Libertree::DB.dbh.sc("SELECT MAX(id) FROM comments"),
    last_chat_message_id: Libertree::DB.dbh.sc(
      "SELECT MAX(id) FROM chat_messages WHERE to_member_id = ? OR from_member_id = ?",
      session_account.account.member.id,
      session_account.account.member.id
    ),
  }
end

EventMachine.run do
  if $conf['secure_websocket']
    options = {
      :host => $conf['websocket_listen_host'],
      :port => 8080,
      :secure => true,
      :tls_options => {
        :private_key_file => $conf['websocket_ssl_private_key'],
        :cert_chain_file => $conf['websocket_ssl_cert']
      }
    }
  else
    options = {
      :host => $conf['websocket_listen_host'],
      :port => 8080,
    }
  end

  EventMachine::WebSocket.start(options) do |ws|
    ws.onopen do
    end

    ws.onclose do
      $sessions.each do |sid,session_data|
        session_data[:sockets].delete ws
      end
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
    $sessions.each do |sid,session_data|
      session_data[:sockets].each do |ws,socket_data|
        account = session_data[:account]
        account.dirty

        # Heartbeat every 60 seconds
        if Time.now.strftime("%S") =~ /[0][01]/
          ws.send(
            {
              'command'   => 'heartbeat',
              'timestamp' => Time.now.strftime('%H:%M:%S'),
            }.to_json
          )
        end

        # Could this data gathering be done in a cleaner, or more elegant way?
        posts = Libertree::Model::Post.s("SELECT * FROM posts WHERE id > ? ORDER BY id", socket_data[:last_post_id])
        rivers_num_posts = Hash.new { |h,k| h[k] = 0 }
        posts.each do |p|
          p.rivers_belonged_to(account).each do |r|
            rivers_num_posts[r] += 1
          end
        end

        rivers_num_posts.each do |river, num_posts|
          ws.send(
            {
              'command'     => 'river-posts',
              'riverId'     => river.id,
              # TODO: i18n
              'numNewPosts' => "#{num_posts} new post#{num_posts == 1 ? '' : 's'}"
            }.to_json
          )
        end
        if posts.any?
          socket_data[:last_post_id] = posts.map(&:id).max
        end

        notifs = Libertree::Model::Notification.s(
          "SELECT * FROM notifications WHERE id > ? AND account_id = ? ORDER BY id LIMIT 1",
          socket_data[:last_notification_id],
          account.id
        )
        notifs.each do |n|
          ws.send(
            {
              'command' => 'notification',
              'id' => n.id,
              'n' => account.num_notifications_unseen
            }.to_json
          )
          socket_data[:last_notification_id] = n.id
        end

        comments = Libertree::Model::Comment.comments_since_id( socket_data[:last_comment_id] )
        comments.each do |c|
          ws.send(
            {
              'command'   => 'comment',
              'commentId' => c.id,
              'postId'    => c.post.id,
            }.to_json
          )
          socket_data[:last_comment_id] = c.id
        end

        chat_messages = Libertree::Model::ChatMessage.s(
          "SELECT * FROM chat_messages WHERE id > ? AND ( to_member_id = ? OR from_member_id = ? ) ORDER BY id",
          socket_data[:last_chat_message_id],
          account.member.id,
          account.member.id
        )
        chat_messages.each do |cm|
          partner = cm.partner_for(account)
          ws.send(
            {
              'command'             => 'chat-message',
              'id'                  => cm.id,
              'partnerMemberId'     => partner.id,
              'numUnseen'           => account.num_chat_unseen,
              'numUnseenForPartner' => account.num_chat_unseen_from_partner(partner),
            }.to_json
          )
          socket_data[:last_chat_message_id] = cm.id
        end
      end
    end
  end
end
