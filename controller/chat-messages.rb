module Controller
  class ChatMessages < Base
    map '/chat'

    before_all do
      require_login
    end

    layout nil

    def _index
      @contacts = Libertree::Model::Member.all.sort_by { |m| m.name_display.downcase }
      @contacts_online = @contacts  # TODO
      @n = account.num_chat_unseen
      @chat_messages = account.chat_messages_unseen
      @partners = @chat_messages.map(&:sender).uniq
    end

    def _tab(member_id)
      @partner = Libertree::Model::Member[member_id.to_i]
      @chat_messages = Libertree::Model::ChatMessage.between(account, @partner)
    end

    def _log(member_id)
      @partner = Libertree::Model::Member[member_id.to_i]
      @chat_messages = Libertree::Model::ChatMessage.between(account, @partner)
    end

    def create
      return  if ! request.post?
      Libertree::Model::ChatMessage.create(
        from_member_id: account.member.id,
        to_member_id: request['to_member_id'].to_i,
        text: request['text']
      )
      ""
    end

    def seen(*chat_message_ids)
      # TODO

      # if notification_ids[0] == 'all'
        # Libertree::DB.dbh.u "UPDATE notifications SET seen = TRUE WHERE account_id = ?", account.id
      # else
        # notification_ids.each do |notification_id|
          # n = Libertree::Model::Notification[ notification_id.to_i ]
          # if n && n.account_id == account.id
            # n.seen = true
          # end
        # end
      # end
      account.dirty
      account.num_chat_unseen
    end

    def unseen(*chat_message_ids)
      # TODO

      # notification_ids.each do |notification_id|
        # n = Libertree::Model::Notification[ notification_id.to_i ]
        # if n && n.account_id == account.id
          # n.seen = false
        # end
      # end
      account.dirty
      account.num_chat_unseen
    end
  end
end
