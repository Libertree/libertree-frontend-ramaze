module Controller
  class Pools < Base
    map '/pools'
    before_all do
      if action.view_value.nil?
        # /pools/_more/ restricts strangers to public posts
        if Ramaze::Current.request.path !~ %r{^/pools/_more}
          require_login
        end
        init_locale
      end
    end

    layout do |path|
      if path =~ %r{\b_|update_post_collection_status}
        nil
      else
        :default
      end
    end

    def index
      @view = 'pools'
      @springs = account.member.springs
      @pools = account.member.pools - @springs
    end
    def _index(target_post_id)
      @pools = account.member.pools
      @post = Libertree::Model::Post[target_post_id.to_i]
    end

    def show(pool_id)
      @view = 'excerpts-view pool'
      @pool = (
        Libertree::Model::Pool[ id: pool_id.to_i, member_id: account.member.id ] ||
        Libertree::Model::Pool[ id: pool_id.to_i, sprung: true, ]
      )
      @river_post_order = session[:river_post_order]
      order_by_updated = session[:river_post_order] == :comment
      if @pool
        @posts = @pool.posts(order_by_updated: order_by_updated, limit: 16)
      else
        @posts = []
      end
      redirect r(:/)  if @pool.nil?
    end

    # careful: filter posts according to view permissions of the requester
    def _more( pool_id, older_or_newer = 'older', time = Time.now.to_i )
      options = {
        limit: 8,
        time: time.to_f,
        newer: false,
      }

      if logged_in?
        @pool = (
          Libertree::Model::Pool[ id: pool_id.to_i, member_id: account.member.id ] ||
          Libertree::Model::Pool[ id: pool_id.to_i, sprung: true ]
        )
      else
        @pool = Libertree::Model::Pool[ id: pool_id.to_i, sprung: true ]
        options[:public] = true
      end

      # TODO: throw error if pool doesn't exist
      @posts = @pool.posts(options)
      render_file "#{Ramaze.options.views[0]}/posts/_excerpts.erb"
    end

    def create
      redirect_referrer  if ! request.post?

      begin
        pool = Libertree::Model::Pool.create(
          member_id: account.member.id,
          name: request['name'].to_s,
          sprung: !! request['sprung']
        )
      rescue Sequel::UniqueConstraintViolation => e
        if e.message =~ /pools_member_id_name_key/
          flash[:error] = _('You already have a pool with that name.')
          redirect_referrer
        else
          raise e
        end
      end

      redirect_referrer
    end

    def destroy(pool_id)
      pool = Libertree::Model::Pool[ member_id: account.member.id, id: pool_id.to_i ]
      if pool
        pool.delete_cascade
      end

      redirect_referrer
    end

    def edit(pool_id)
      @view = 'pools'
      @host = request.host_with_port
      @pool = Libertree::Model::Pool[ member_id: account.member.id, id: pool_id.to_i ]
      redirect_referrer  if @pool.nil?
    end

    def update(pool_id)
      redirect r(:/)  if ! request.post?

      @pool = Libertree::Model::Pool[ member_id: account.member.id, id: pool_id.to_i ]
      redirect r(:/)  if @pool.nil?

      begin
        @pool.name = request['name'].to_s
        @pool.sprung = !! request['sprung']
        spring_url_name = request['spring_url_name'].to_s.downcase.strip
        @pool.spring_url_name = spring_url_name.empty? ? nil : spring_url_name
        @pool.save
      rescue Sequel::CheckConstraintViolation => e
        if e.message =~ /valid_spring_url_name/
          flash[:error] = _('The spring URL may only consist of letters, hyphens or underscores.')
          redirect_referrer
        else raise e end
      rescue Sequel::UniqueConstraintViolation => e
        if e.message =~ /unique_spring_url_name/
          flash[:error] = _('You already have a spring with this name.')
          redirect_referrer
        else raise e end
      rescue Sequel::DatabaseError => e
        if e.message =~ /value too long/
          # TODO: does this depend on the postgresql locale?
          flash[:error] = _('The custom spring URL is too long.  You may use up to 64 characters.')
          redirect_referrer
        else raise e end
      end

      redirect r(:/)
    end

    # TODO: convert this to API endpoint?
    def update_post_collection_status
      redirect_referrer  if ! request.post?

      if ! request['post_id']
        # pool_ids may be empty if the post is removed from all pools
        return { 'success' => false, 'msg' => _('Missing parameters.') }.to_json
      end

      post_id = request['post_id'].to_i
      post = Libertree::Model::Post[ id: post_id ]
      return { 'success' => false, 'msg' => _('Post does not exist.') }.to_json  if post.nil?

      if request['pool_name']
        begin
          pool_name = request['pool_name'].to_s.strip

          # TODO: validate post name in model
          if pool_name.empty?
            return {
              'success' => false,
              'msg' => _('Failed to create pool or add post.')
            }.to_json
          end

          pool = Libertree::Model::Pool.
            find_or_create(member_id: account.member.id,
                           name: pool_name)
          pool << post
          return {
            'success' => true,
            'msg'     => _("Post added to &ldquo;%s&rdquo; pool.") % pool.name,
            'count'   => 1
          }.to_json
        rescue
          return {
            'success' => false,
            'msg' => _('Failed to create pool or add post.')
          }.to_json
        end
      end

      pool_ids = if request['pool_ids']
                   request['pool_ids'].map(&:to_i)
                 else
                   []
                 end

      post.update_collection_status_for_member(account.member.id, pool_ids)
      count = post.pools_by_member(account.member.id).count

      {
        'success' => true,
        'msg'     => _('Post collections updated.'),
        'count'   => count
      }.to_json
    end

    def _remove_post(pool_id, post_id)
      pool = Libertree::Model::Pool[ member_id: account.member.id, id: pool_id.to_i ]
      # TODO: indicate failure
      return  if pool.nil?
      post = Libertree::Model::Post[ id: post_id.to_i ]
      # TODO: indicate failure
      return  if post.nil?

      pool.remove_post post
    end
  end
end
