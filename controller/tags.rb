module Controller
  class Tags < Base
    map '/tags'
    before_all do
      default_before_filter
    end

    layout do |path|
      if path =~ /^_more/
        nil
      elsif session[:layout] == 'narrow'
        :narrow
      else
        :default
      end
    end

    def index(tag)
      redirect_referrer  if tag.nil?
      @view = "excerpts-view tags"
      @tag = tag.downcase
      @rivers = account.rivers_not_appended

      # TODO: better name for river_post_order?
      @post_order = session[:river_post_order]
      @posts = Libertree::Model::Post.with_tag(
        tag: tag,
        order_by: @post_order,
        limit: 16,
      ).reverse
    end

    def _more( tag, older_or_newer = 'older', time = Time.now.to_i )
      @posts = Libertree::Model::Post.with_tag(
        tag: tag,
        order_by: session[:river_post_order],
        limit: 8,
        time: time.to_f,
        newer: ( older_or_newer == 'newer' ),
      )
    end
  end
end
