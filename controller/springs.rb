module Controller
  class Springs < Base
    map '/s'

    before_all do
      # TODO: grant non-members access if the spring is public,
      #       but only show internet visible posts
      default_before_filter
    end

    layout do |path|
      if session[:layout] == 'narrow'
        :narrow
      else
        :default
      end
    end

    def index(username, spring_name)
      @view = 'excerpts-view pool'

      account = Libertree::Model::Account[ username: username ]
      if account
        @spring = Libertree::Model::Pool[
          spring_url_name: spring_name,
          sprung: true,
          member_id: account.member.id
        ]
      end

      redirect r(:/)  if @spring.nil?

      render_file("#{Ramaze.options.views[0]}/pools/show.xhtml",
                  { :pool => @spring,
                    :member => account.member })
    end
  end
end
