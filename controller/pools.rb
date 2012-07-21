module Controller
  class Pools < Base
    map '/pools'

    before_all do
      require_login
    end

    layout do |path|
      if path =~ %r{\b_|create_pool_and_add_post}
        nil
      elsif session[:layout] == 'narrow'
        :narrow
      else
        :default
      end
    end

    def index
      @pools = account.pools
    end
    def _index(target_post_id)
      @pools = account.pools
      @post = Libertree::Model::Post[target_post_id.to_i]
    end

    def show(pool_id)
      @view = 'excerpts-view'
      @pool = Libertree::Model::Pool[ account_id: account.id, id: pool_id.to_i ]
      redirect r(:/)  if @pool.nil?
    end

    def create
      redirect_referrer  if ! request.post?

      begin
        pool = Libertree::Model::Pool.create(
          account_id: account.id,
          name: request['name'].to_s
        )
      rescue PGError => e
        if e.message =~ /pools_account_id_name_key/
          flash[:error] = 'You already have a pool with that name.'
          redirect_referrer
        else
          raise e
        end
      end

      redirect_referrer
    end

    def destroy(pool_id)
      pool = Libertree::Model::Pool[ account_id: account.id, id: pool_id.to_i ]
      if pool
        pool.delete_cascade
      end

      redirect_referrer
    end

    def edit(pool_id)
      @pool = Libertree::Model::Pool[ account_id: account.id, id: pool_id.to_i ]
      redirect_referrer  if @pool.nil?
    end

    def update(pool_id)
      redirect r(:/)  if ! request.post?

      @pool = Libertree::Model::Pool[ account_id: account.id, id: pool_id.to_i ]
      redirect r(:/)  if @pool.nil?

      @pool.name = request['name'].to_s

      redirect r(:/)
    end

    def add_post(pool_id, post_id)
      pool = Libertree::Model::Pool[ account_id: account.id, id: pool_id.to_i ]
      return  if pool.nil?
      post = Libertree::Model::Post[ id: post_id.to_i ]
      return  if post.nil?

      pool << post

      ""
    end

    def create_pool_and_add_post(pool_name, post_id)
      post = Libertree::Model::Post[ id: post_id.to_i ]
      return ''  if post.nil?

      pool = Libertree::Model::Pool.find_or_create(
        account_id: account.id,
        name: pool_name.to_s
      )
      pool << post

      { 'success' => true }.to_json
    end

    def remove_post(pool_id, post_id)
      pool = Libertree::Model::Pool[ account_id: account.id, id: pool_id.to_i ]
      redirect_referrer  if pool.nil?
      post = Libertree::Model::Post[ id: post_id.to_i ]
      redirect_referrer  if post.nil?

      pool.remove_post post

      redirect_referrer
    end
  end
end
