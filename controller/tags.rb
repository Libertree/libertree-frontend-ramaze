module Controller
  class Tags < Base
    map '/tags'
    before_all do
      default_before_filter
    end

    layout do |path|
      if session[:layout] == 'narrow'
        :narrow
      else
        :default
      end
    end

    def index(tag)
      redirect_referrer  if tag.nil?
      @view = "excerpts-view tags"

      # TODO: directly call _more?
      @post_order = session[:river_post_order]
      @posts = Libertree::Model::Post.with_tag(
        tag: tag,
        order_by: @post_order,
        limit: 16,
      ).reverse
    end

    def _more( tag, older_or_newer = 'older', time = Time.now.to_i )
      @post_order = session[:river_post_order]
      @posts = Libertree::Model::Post.with_tag(
        tag: tag,
        order_by: @post_order,
        limit: 8,
        time: time.to_f,
        newer: ( older_or_newer == 'newer' ),
      ).reverse
    end
  end
end
