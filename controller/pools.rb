module Controller
  class Pools < Base
    map '/pools'
    before_all do
      default_before_filter
    end

    layout do |path|
      if path =~ %r{\b_|create_pool_and_add_post|add_post}
        nil
      elsif session[:layout] == 'narrow'
        :narrow
      else
        :default
      end
    end

    def index
      @pools = account.member.pools
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
      redirect r(:/)  if @pool.nil?
    end

    def create
      redirect_referrer  if ! request.post?

      begin
        pool = Libertree::Model::Pool.create(
          member_id: account.member.id,
          name: request['name'].to_s,
          sprung: !! request['sprung']
        )
      rescue PGError => e
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
      @pool = Libertree::Model::Pool[ member_id: account.member.id, id: pool_id.to_i ]
      redirect_referrer  if @pool.nil?
    end

    def update(pool_id)
      redirect r(:/)  if ! request.post?

      @pool = Libertree::Model::Pool[ member_id: account.member.id, id: pool_id.to_i ]
      redirect r(:/)  if @pool.nil?

      @pool.name = request['name'].to_s
      @pool.sprung = !! request['sprung']

      redirect r(:/)
    end

    def add_post(pool_id, post_id)
      error = {
        'success' => false,
        'msg' => _('Failed to add post to pool.')
      }

      pool = Libertree::Model::Pool[ member_id: account.member.id, id: pool_id.to_i ]
      return error.to_json if pool.nil?
      post = Libertree::Model::Post[ id: post_id.to_i ]
      return error.to_json if post.nil?

      pool << post

      {
        'success' => true,
        'msg' => _("Post added to &ldquo;%s&rdquo; pool.") % pool.name
      }.to_json
    end

    def create_pool_and_add_post(pool_name, post_id)
      error = {
        'success' => false,
        'msg' => _('Failed to create pool or add post.')
      }
      post = Libertree::Model::Post[ id: post_id.to_i ]
      return error.to_json if post.nil?

      pool = Libertree::Model::Pool.find_or_create(
        member_id: account.member.id,
        name: pool_name.to_s
      )
      pool << post

      { 'success' => true }.to_json
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
