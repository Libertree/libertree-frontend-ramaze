module Controller
  class Accounts < Base
    map '/accounts'

    before_all do
      require_login
      init_locale
    end

    def edit
      @invitations = account.invitations_not_accepted
      @host = request.host_with_port
      @export_filename = "libertree-data-#{account.username}-#{Time.now.strftime('%Y-%m-%d')}.json"
    end

    def update
      redirect_referrer  if ! request.post?

      begin
        if request['excerpt_max_height'].nil? || request['excerpt_max_height'].to_s.empty?
          account.excerpt_max_height = nil
        else
          account.excerpt_max_height = request['excerpt_max_height'].to_i
        end
      rescue PGError => e
        if e.message =~ /valid_excerpt_max_height/
          flash[:error] = _('Post excerpt maximum height: Please enter a number greater than or equal to 200, or no number for no maximum.')
          redirect_referrer
        end
      end

      if request['custom_link'] && ! request['custom_link'].to_s.empty?
        account.custom_link = request['custom_link'].to_s
      else
        account.custom_link = nil
      end

      if request['email'].nil? || request['email'].to_s.strip.empty?
        account.email = nil
      else
        account.email = request['email'].to_s
      end
      account.custom_css = request['custom_css'].to_s
      account.custom_js = request['custom_js'].to_s
      account.autoembed = !! request['autoembed']
      account.thumbnail = !! request['thumbnail']
      account.locale = request['locale'].to_s
      session[:locale] = account.locale

      flash[:notice] = _('Settings saved.')
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

    def change_password
      return  if ! request.post?

      if request['password'].to_s != request['password_again'].to_s
        flash[:error] = _('Passwords did not match.  Please reenter.')
      else
        account.password = request['password'].to_s
        account.password_reset_code = nil
        account.password_reset_expiry = nil
        flash[:notice] = _('Password changed.')
        redirect r(:edit)
      end
    end

    provide(:json, :type => 'application/json') do |action, value|
      state = JSON::Ext::Generator::State.new
      state.indent = "  "
      state.array_nl = "\n"
      state.object_nl = "\n"
      value.to_json(state)
    end

    def data(filename = nil)
      account.data_hash
    end

    def heartbeat
      account.time_heartbeat = Time.now
    end
  end
end
