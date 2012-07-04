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
      @partner_active = @partners[0]
    end

    def _tab(member_id, active = false)
      @partner = Libertree::Model::Member[member_id.to_i]
      @chat_messages = Libertree::Model::ChatMessage.between(account, @partner)
      @active = active
      if @active
        @n = 0
      else
        @n = account.num_chat_unseen_from_partner(@partner)
      end
    end

    def _log(member_id, active = false)
      @partner = Libertree::Model::Member[member_id.to_i]
      @chat_messages = Libertree::Model::ChatMessage.between(account, @partner)
      @active = active
    end

    def _message(chat_message_id)
      @message = Libertree::Model::ChatMessage[ chat_message_id.to_i ]
      if @message.from_member_id != account.member.id && @message.to_member_id != account.member.id
        @message = nil
      end
    end

    def create
      return  if ! request.post?
      Libertree::Model::ChatMessage.create(
        from_member_id: account.member.id,
        to_member_id: request['to_member_id'].to_i,
        text: request['text']
      )
      { 'success' => true }.to_json
    end

    def seen(member_id)
      Libertree::Model::ChatMessage.mark_seen_between(account, member_id)
      account.dirty
      account.num_chat_unseen
    end
  end
end
