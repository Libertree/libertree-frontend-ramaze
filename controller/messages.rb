module Controller
  class Messages < Base
    map '/messages'
    before_all do
      default_before_filter
    end

    layout do |path|
      if path =~ %r{^_}
        nil
      else
        :default
      end
    end

    def index
      @messages = account.messages
      @view = 'messages'
    end

    def create
      redirect_referrer  if ! request.post?

      if request['text'].to_s.empty?
        flash[:error] = _('You cannot send an empty message.')
        redirect_referrer
      end

      if request['recipients'].to_s.empty?
        flash[:error] = _('You did not specify a recipient. Please try again.')
        redirect_referrer
      end

      begin
        message = Libertree::Model::Message.create_with_recipients(
          sender_member_id: account.member.id,
          text: request['text'].to_s,
          recipient_member_ids: request['recipients'].split(",")
        )

        trees = message.recipients.reduce(Set.new) { |_trees, recipient|
          if recipient.tree
            _trees << recipient.tree
          end
          _trees
        }
        recipient_ids = message.recipients.map(&:id)

        trees.each do |tree|
          Libertree::Model::Job.create(
            {
              task: 'request:MESSAGE',
              params: {
                'message_id'           => message.id,
                'server_id'            => tree.id,
                'recipient_member_ids' => recipient_ids,
              }.to_json,
            }
          )
        end
      rescue PGError => e
        # TODO: this may fail when postgresql is running in a non-English locale
        if e.message =~ /value too long/
          flash[:error] = _('Your message is longer than 4096 characters. Please shorten it and try again.')
          redirect_referrer
        else
          raise e
        end
      end

      session[:saved_text]["textarea-message-new"] = nil

      redirect r(:show, message.id)
    end

    def show(message_id)
      @view = 'messages'
      @message = Libertree::Model::Message[message_id.to_i]
      redirect_referrer  if @message.nil?
      redirect_referrer  if ! @message.visible_to?(account)
      Libertree::Model::Notification.mark_seen_for_account_and_message(account, @message)
      other_participants = [@message.sender] + @message.recipients - [account.member]
      @participants = other_participants.map {|m| {"id"=>m.id, "text"=>m.handle}}
    end

    def _new; end

    provide(:json, type: 'application/json') { |action,value| value.to_json }
    def search
      query = request['q'].to_s
      return '[]'  if query.empty?

      members = Libertree::Model::Member.search(query)
      accounts = Libertree::Model::Account.search(query)

      result = members.map do |m|
        { 'id' => m.id,
          'text' => m.handle }
      end
      result + accounts.map do |a|
        { 'id' => a.member.id,
          'text' => a.member.handle }
      end
    end
  end
end
