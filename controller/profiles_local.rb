module Controller
  class ProfilesLocal < Base
    map '/p'
    before_all do
      default_before_filter
    end

    layout do |path|
      if path =~ %r{^_}
        nil
      elsif session[:layout] == 'narrow'
        :narrow
      else
        :default
      end
    end

    def index( username )
      @view = "excerpts-view profile"
      return  if username.nil?

      account = Libertree::Model::Account[ username: username ]
      if account.nil?
        redirect_referrer
      end

      render_file("#{Ramaze.options.views[0]}/profiles/show.xhtml",
                  { :profile => account.member.profile,
                    :member => account.member })
    end
  end
end

