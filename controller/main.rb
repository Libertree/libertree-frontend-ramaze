module Controller
  class Main < Base
    map '/'

    before_all do
      if action.view_value.nil?
        init_locale
      end
    end

    layout do |path|
      case path
      when 'search'
        if session[:layout] == 'narrow'
          :narrow
        else
          :default
        end
      else
        :splash
      end
    end

    def index
      if logged_in?
        redirect Home.r(:/)
      else
        redirect r(:login)
      end
    end

    def login
      @view = 'splash'
      if logged_in?
        redirect Home.r(:/)
      end
      force_mobile_to_narrow

      if account_login( request.subset('password_reset_code') )
        redirect Accounts.r(:change_password)
      end

      @logging_in = true
      if request.post?
        a = account_login( request.subset('username', 'password') )
        if a
          session[:saved_text] = Hash.new
          session[:chats_closed] = Set.new
          if $post_login_path
            # Used in spec suite
            redirect $post_login_path
          elsif session[:back]
            target = session[:back]
            session[:back] = nil
            redirect target
          else
            redirect Controller::Home.r(:/)
          end
        else
          flash[:error] = _('Invalid credentials.')
          redirect r(:login)
        end
      end
    end

    def logout
      session[:saved_text] = nil
      session[:chats_closed] = nil
      account_logout
      flash[:notice] = _('You have been logged out.')
      redirect r(:login)
    end

    # TODO: Move to Accounts controller?
    def signup
      @view = 'splash'
      redirect '/intro'  if logged_in?
      force_mobile_to_narrow

      @invitation_code = request['invitation_code'].to_s.sub(%r{http?://#{request.host_with_port}/signup\?invitation_code=},"")

      return  if ! request.post?

      invitation = Libertree::Model::Invitation[ code: @invitation_code ]
      if invitation.nil?
        flash[:error] = _('A valid invitation code is required.')
        return
      end

      if ! invitation.account_id.nil?
        flash[:error] = _('This invitation code has already been used. Try another one!')
        return
      end

      if request['password'].to_s != request['password-confirm'].to_s
        flash[:error] = _('You mistyped your password.')
        return
      end

      username = request['username'].to_s.strip

      # TODO: Constrain email addresses, or at least strip out unsafe HTML, etc. with Loofah, or such.
      email = request['email'].to_s.strip
      if email.empty?
        email = nil
      end

      begin
        a = Libertree::Model::Account.create(
          username: username,
          password_encrypted: BCrypt::Password.create( request['password'].to_s ),
          email: email
        )
        invitation.account_id = a.id

        account_login request.subset('username', 'password')
        flash[:error] = nil
        redirect Intro.r(:/)
      rescue PGError => e
        case e.message
        # TODO: we need to find a better solution than matching on error strings,
        #       because PostgreSQL translates them under non-English locales.
        # duplicate key value violates unique constraint "accounts_username_key"
        when /accounts_username_key/
          flash[:error] = _('Username %s is taken.  Please choose another.') % request['username'].inspect
        # constraint "username_valid"
        when /username_valid/
          flash[:error] = _('Username must be at least 2 characters long and consist only of lowercase letters, numbers, underscores and dashes.')
        else
          raise e
        end
      end
    end

    def layout(width)
      case width
      when 'narrow'
        session[:layout] = 'narrow'
      when 'wide'
        session[:layout] = 'default'
      end
      redirect_referrer
    end

    def _render
      require_login
      respond Libertree.render( request['s'].to_s, account.autoembed, account.filter_images )
    end

    # This is not in the Posts controller because we will handle many other search
    # types from the one searh box in the near future.
    def search
      redirect_referrer  if ! request.post?

      @q = request['q'].to_s
      @posts = Libertree::Model::Post.search(@q)
      @comments = Libertree::Model::Comment.search(@q)
      @profiles = Libertree::Model::Profile.search(@q)
      @view = 'search'
    end

    # TODO: don't render page
    def textarea_save
      # Check valid session first.
      if session[:saved_text]
        session[:saved_text][ request['id'].to_s ] = request['text'].to_s
      end
    end

    # TODO: don't render page
    def textarea_clear(id)
      # Check valid session first.
      if session[:saved_text]
        session[:saved_text][id] = nil
      end
    end

    def request_password_reset
      Ramaze::Log.debug request.inspect
      return  if ! request.post?

      a = Libertree::Model::Account.set_up_password_reset_for( request['email'].to_s )
      if a
        # TODO: Make a generic method for queuing email
        Libertree::Model::Job.create(
          task: 'email',
          params: {
            'to'      => request['email'].to_s,
            'subject' => _('[Libertree] Password reset'),
            'body'    => %{
Someone (IP address: #{request.ip}) has requested that a password reset link
be sent to this email address.  If you wish to change your Libertree password
now, visit:

http://#{request.host_with_port}/login?password_reset_code=#{a.password_reset_code}

This link is only valid for 1 hour.
            }
          }.to_json
        )
      end

      flash[:notice] = _('A password reset link has been sent for the account with that email address.')

      redirect_referrer
    end

    # Used in specs, to reduce spec suite execution time
    def test_user_logged_in
      'Test user logged in'
    end
  end
end
