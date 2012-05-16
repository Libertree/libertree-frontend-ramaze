module Controller
  class Home < Base
    map '/home'

    before_all { require_login }

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
      @rivers = account.rivers
      if @rivers.any?
        session[:river_current] = Libertree::Model::River[ account_id: account.id, id: river_id.to_i ] || account.home_river || session[:river_current]

        if session[:river_current].nil? || ! @rivers.include?(session[:river_current])
          session[:river_current] = account.home_river || @rivers[0]
        end

        post = session[:river_current].posts[-1]
        if post
          session[:post_current] ||= post
        end
      end

      @selected_post = session[:post_current]
      @river_post_order = session[:river_post_order]
      if session[:river_current]
        @river = session[:river_current]
        @posts = session[:river_current].posts( order_by: @river_post_order, limit: 16 )
      else
        @posts = []
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
