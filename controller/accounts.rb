module Controller
  class Accounts < Base
    map '/accounts'

    before_all do
      require_login
    end

    def edit
      @invitations = account.invitations_not_accepted
      @host = request.host_with_port
      @export_filename = "libertree-data-#{account.username}-#{Time.now.strftime('%Y-%m-%d')}.json"
    end

    def update
      redirect_referrer  if ! request.post?

      begin
        if request['excerpt_max_height'].nil? || request['excerpt_max_height'].empty?
          account.excerpt_max_height = nil
        else
          account.excerpt_max_height = request['excerpt_max_height'].to_i
        end
      rescue PGError => e
        if e.message =~ /valid_excerpt_max_height/
          flash[:error] = 'Post excerpt maximum height: Please enter a number greater than or equal to 200, or no number for no maximum.'
          redirect_referrer
        end
      end

      if request['custom_link'] && ! request['custom_link'].empty?
        account.custom_link = request['custom_link']
      else
        account.custom_link = nil
      end

      if request['email'].nil? || request['email'].strip.empty?
        account.email = nil
      else
        account.email = request['email']
      end
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

    def watch_post(post_id)
      post = Libertree::Model::Post[post_id.to_i]
      if post
        account.watch_post post
      end
    end

    def change_password
      return  if ! request.post?

      if request['password'] != request['password_again']
        flash[:error] = "Passwords did not match.  Please reenter."
      else
        account.password = request['password']
        account.password_reset_code = nil
        account.password_reset_expiry = nil
        flash[:notice] = "Password changed."
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
