module Controller
  module Admin
    class Main < Controller::Admin::Base
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
        @forests = Libertree::Model::Forest.all.sort_by(&:name)
        @servers = Libertree::Model::Server.all.sort_by(&:name_display)
        @local_host = request.host
      end
    end
  end
end
