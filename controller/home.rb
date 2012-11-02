module Controller
  class Home < Base
    map '/home'
    before_all do
      default_before_filter
    end

    layout do |path|
      if path =~ /_post_icon/
        nil
      elsif session[:layout] == 'narrow'
        :narrow
      else
        :default
      end
    end

    def index(river_id = nil)
      @view = "excerpts-view home"
      @rivers = account.rivers_not_appended
      @river = Libertree::Model::River[ account_id: account.id, id: river_id.to_i ] || account.home_river || @rivers[0]
      @river_post_order = session[:river_post_order]
      if @river
        @posts = @river.posts( order_by: @river_post_order, limit: 16 )
      else
        @posts = []
        @no_rivers = true
      end
    end

    def mark_all_read
      Libertree::Model::Post.mark_all_as_read_by account
      redirect_referrer
    end

    def sort_by_time_updated_overall
      session[:river_post_order] = :comment
      redirect_referrer
    end
    def sort_by_time_created
      session[:river_post_order] = nil
      redirect_referrer
    end
  end
end
