module Controller
  class Notifications < Base
    map '/notifications'
    before_all do
      default_before_filter
    end

    layout do |path|
      if path =~ %r{seen}
        nil
      else
        :default
      end
    end

    def index
      @view = "notifications"
    end

    def seen(*notification_ids)
      Libertree::Model::Notification.mark_seen_for_account(account, notification_ids)
      account.num_notifications_unseen
    end

    def unseen(*notification_ids)
      Libertree::Model::Notification.mark_unseen_for_account(account, notification_ids)
      account.num_notifications_unseen
    end

    def seen_comments(*comment_ids)
      Libertree::Model::Notification.mark_seen_for_account_and_comment_id(account, comment_ids)
      account.num_notifications_unseen
    end

    def num_unseen
      account.num_notifications_unseen
    end
  end
end
