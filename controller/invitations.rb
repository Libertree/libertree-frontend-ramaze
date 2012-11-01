module Controller
  class Invitations < Base
    map '/invitations'
    before_all do
      default_before_filter
    end

    def create
      if account.new_invitation.nil?
        flash[:error] = _('Failed to create invitation.  You may only have up to 5 unaccepted invitations at once.')
      end

      redirect_referrer
    end
  end
end
