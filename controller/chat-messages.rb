module Controller
  class ChatMessages < Base
    map '/chat'

    before_all do
      require_login
    end

    layout nil

    def _index
      @contacts = Libertree::Model::Member.
        all.
        reject { |m| m == account.member }.
        sort_by { |m| m.name_display.downcase }
      @contacts_online = @contacts  # TODO
      @n = account.num_chat_unseen
      @partners = account.
        chat_partners_current.
        reject { |m|
          session[:chats_closed].include? m.id
        }
      @partner_active = @partners.find(&:has_unseen_from_other) || @partners[0]
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
      session[:chats_closed].delete @partner.id
    end

    def _message(chat_message_id)
      @message = Libertree::Model::ChatMessage[ chat_message_id.to_i ]
      if @message.from_member_id != account.member.id && @message.to_member_id != account.member.id
        @message = nil
      end
    end

    def create
      return  if ! request.post?

      cm = Libertree::Model::ChatMessage.create(
        from_member_id: account.member.id,
        to_member_id: request['to_member_id'].to_i,
        text: request['text']
      )
      if cm.recipient.tree
        Libertree::Model::Job.create(
          {
            task: 'request:CHAT',
            params: {
              'chat_message_id' => cm.id,
              'server_id'       => cm.recipient.tree.id,
            }.to_json,
          }
        )
      end

      { 'success' => true }.to_json
    end

    def seen(member_id)
      Libertree::Model::ChatMessage.mark_seen_between(account, member_id)
      account.dirty
      account.num_chat_unseen
    end

    def closed(member_id)
      session[:chats_closed] << member_id.to_i
    end
  end
end
