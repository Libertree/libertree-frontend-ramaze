module Controller
  class Messages < Base
    map '/messages'
    before_all do
      default_before_filter
    end

    layout do |path|
      if path =~ %r{^_}
        nil
      elsif session[:layout] == 'narrow'
        :narrow
      else
        :default
      end
    end

    def index
      @messages = account.messages
      @view = 'messages-index'
    end

    def create
      redirect_referrer  if ! request.post?
      redirect_referrer  if request['text'].to_s.empty?

      begin
        message = Libertree::Model::Message.create_with_recipients(
          sender_member_id: account.member.id,
          text: request['text'].to_s,
          recipient_member_ids: request['recipients']
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
      @message = Libertree::Model::Message[message_id.to_i]
      redirect_referrer  if @message.nil?
      redirect_referrer  if ! @message.visible_to?(account)
      Libertree::Model::Notification.mark_seen_for_account_and_message(account, @message)
    end

    def _new
      @contacts = Libertree::Model::Member.all.sort_by { |m| m.name_display.downcase }
    end
  end
end
