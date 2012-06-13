module Controller
  class Accounts < Base
    map '/accounts'

    before_all do
      require_login
    end

    def edit
      @invitations = account.invitations_not_accepted
      @host = request.host_with_port
    end

    def update
      redirect_referrer  if ! request.post?

      account.custom_css = request['custom_css']
      account.custom_js = request['custom_js']

      flash[:notice] = "Settings saved."
      redirect_referrer
    end

    def generate_api_token
      account.generate_api_token
      redirect_referrer
    end

    def font(choice = nil)
      case choice
      when 'small'
        account.font_css = 'fonts-small'
      else
        account.font_css = nil
      end

      redirect_referrer
    end
  end
end
