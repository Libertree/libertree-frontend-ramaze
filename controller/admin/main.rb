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
        @forests = Libertree::Model::Forest.all
        @servers = Libertree::Model::Server.all
      end
    end
  end
end
