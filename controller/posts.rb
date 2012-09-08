module Controller
  class Posts < Base
    map '/posts'

    before_all do
      if Ramaze::Current.request.path !~ %r{^/posts/show/}
        require_login
      end
      init_locale
    end

    layout do |path|
      if path =~ %r{\b_}
        nil
      elsif session[:layout] == 'narrow'
        :narrow
      else
        :default
      end
    end

    def index
      @posts = Libertree::Model::Post.s("SELECT * FROM posts ORDER BY id DESC")
    end

    def _excerpts( river_id, older_or_newer = 'older', time = Time.now.to_i )
      @river = Libertree::Model::River[ account_id: account.id, id: river_id.to_i ]
      if @river.nil?
        @posts = []
      else
        @river_post_order = session[:river_post_order]
        @posts = @river.posts(
          order_by: @river_post_order,
          limit: 8,
          time: time.to_f,
          newer: ( older_or_newer == 'newer' ),
        ).reverse
      end
    end

    def create
      redirect_referrer  if ! request.post?

      if request['hashtags'] && ! request['hashtags'].to_s.strip.empty?
        hashtags = "\n\n" + request['hashtags'].to_s.strip.
          split(/[;., ]+/).
          map { |tag|
            if tag[0] != '#'
              '#' + tag
            else
              tag
            end
          }.join(' ')
      else
        hashtags = ''
      end

      text = ( request['text'].to_s + hashtags )
      text.encode!('UTF-16', 'UTF-8', :invalid => :replace, :replace => '?')
      text.encode!('UTF-8', 'UTF-16')

      if text.empty?
        flash[:error] = _('Post may not be empty.')
        redirect_referrer
      end

      visibility = request['visibility'].to_s

      if text.length > 32
        post = Libertree::Model::Post[
          member_id: account.member.id,
          visibility: visibility,
          text: text
        ]
        if post
          flash[:error] = _('You already posted that. (%s)' % ago(post.time_created) )
          redirect_referrer
        end
      end

      post = Libertree::Model::Post.create(
        'member_id'  => account.member.id,
        'visibility' => visibility,
        'text'       => text
      )
      session[:saved_text]['textarea-post-new'] = nil

      redirect r(:show, post.id)
    end

    def show(post_id, from_comment_id = nil)
      @view = "single-post-view"
      @post = Libertree::Model::Post[post_id.to_i]
      if @post.nil?
        respond "404: Not Found", 404
      else
        if ! @post.v_internet?
          require_login
        end

        @subtitle = %{#{@post.member.name_display} - "#{@post.glimpse}"}
        if from_comment_id
          @comment_fetch_options = {
            from_id: from_comment_id.to_i,
          }
        else
          @comment_fetch_options = {
            limit: 8,
          }
        end

        if logged_in?
          @post.mark_as_read_by account
          Libertree::Model::Notification.mark_seen_for_account_and_post  account, @post
        end
      end
    end

    def read(post_id)
      post = Libertree::Model::Post[post_id.to_i]
      if post
        post.mark_as_read_by account
      end
      ""
    end

    def unread(post_id)
      post = Libertree::Model::Post[post_id.to_i]
      if post
        post.mark_as_unread_by account
      end
      ""
    end

    def subscribe(post_id)
      post = Libertree::Model::Post[post_id.to_i]
      if post
        account.subscribe_to post
      end
      ""
    end

    def unsubscribe(post_id)
      post = Libertree::Model::Post[post_id.to_i]
      if post
        account.unsubscribe_from post
      end
      ""
    end

    def destroy(post_id)
      post = Libertree::Model::Post[post_id.to_i]
      if post && post.member == account.member
        post.delete_cascade
      end

      if request.env['HTTP_REFERER'] =~ %r{/posts/show/#{post_id}}
        redirect Home.r(:/)
      else
        redirect_referrer
      end
    end

    def edit(post_id)
      @post = Libertree::Model::Post[post_id.to_i]
      redirect_referrer  if @post.nil?
      session[:saved_text]['textarea-post-edit'] = @post.text
    end

    def update
      redirect_referrer  if ! request.post?
      post = Libertree::Model::Post[ request['post_id'].to_i ]
      redirect_referrer  if post.nil? || post.member != account.member

      if ! request.params['cancel']
        text = request['text'].to_s
        # TODO: DRY up along with #encode! calls in #create action
        text.encode!('UTF-16', 'UTF-8', :invalid => :replace, :replace => '?')
        text.encode!('UTF-8', 'UTF-16')

        post.revise text, request['visibility'].to_s
        session[:saved_text]['textarea-post-edit'] = nil
      end

      redirect Posts.r(:show, post.id)
    end
  end
end
