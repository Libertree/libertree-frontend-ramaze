module Controller
  class Admin < Base
    map '/admin'

    before_all { require_admin }

    layout do |path|
      if session[:layout] == 'narrow'
        :narrow
      else
        :default
      end
    end

    def index
      @forests = Libertree::Model::Forest.all
      @servers = Libertree::Model::Server.all
    end

    protected

    def require_admin
      require_login
      if ! account.admin?
        flash[:error] = 'Administrative privileges required.'
        redirect Main.r(:/)
      end
    end
  end
end
