module Controller
  class Main < Base
    map '/'

    def index
      force_mobile_to_narrow
    end

    def login
      if logged_in?
        redirect Home.r(:/)
      end
      force_mobile_to_narrow

      @logging_in = true
      if request.post?
        a = account_login( request.subset('username', 'password') )
        if a
          if session[:back]
            target = session[:back]
            session[:back] = nil
            redirect target
          else
            redirect Controller::Home.r(:/)
          end
        else
          flash[:error] = 'Invalid credentials.'
          redirect r(:login)
        end
      end
    end

    def logout
      account_logout
      flash[:notice] = 'You have been logged out.'
      redirect r(:login)
    end

    # TODO: Move to Accounts controller?
    def signup
      redirect '/'  if logged_in?
      force_mobile_to_narrow

      @invitation_code = request['invitation_code']

      return  if ! request.post?

      invitation = Libertree::Model::Invitation[ code: @invitation_code, account_id: nil ]
      if invitation.nil?
        flash[:error] = 'A valid invitation code is required.'
        return
      end

      if request['password'] != request['password-confirm']
        flash[:error] = 'You mistyped your password.'
        return
      end

      username = request['username'].strip

      # TODO: Constrain email addresses, or at least strip out unsafe HTML, etc. with Loofah, or such.
      email = request['email'].strip
      if email.empty?
        email = nil
      end

      begin
        a = Libertree::Model::Account.create(
          username: username,
          password_encrypted: BCrypt::Password.create( request['password'] ),
          email: email
        )
        invitation.account_id = a.id
        Libertree::Model::Job.create(
          task: 'request:MEMBER',
          params: {
            'member_id' => a.member.id,
          }.to_json
        )

        account_login request.subset('username', 'password')
        redirect Home.r(:/)
      rescue PGError => e
        case e.message
        when /duplicate key value violates unique constraint "accounts_username_key"/
          flash[:error] = "Username #{request['username'].inspect} is taken.  Please choose another."
        when /constraint "username_valid"/
          flash[:error] = "Username must be at least 2 characters long and consist only of lowercase letters, numbers, underscores and dashes."
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
      respond Libertree.render( request['s'] )
    end

    # This is not in the Posts controller because we will handle many other search
    # types from the one searh box in the near future.
    def search
      @q = request['q']
      @posts = Libertree::Model::Post.search(@q)
      @comments = Libertree::Model::Comment.search(@q)
    end

    def textarea_save
      # Check valid session first.
      if session[:saved_text]
        session[:saved_text][ request['id'] ] = request['text']
      end
    end

    def textarea_clear(id)
      # Check valid session first.
      if session[:saved_text]
        session[:saved_text][id] = nil
      end
    end
  end
end
