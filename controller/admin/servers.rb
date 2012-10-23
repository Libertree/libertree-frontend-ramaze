module Controller
  module Admin
    class Servers < Controller::Admin::Base
      map '/admin/servers'

      before_all do
        require_admin
        init_locale
      end

      layout do |path|
        if session[:layout] == 'narrow'
          :narrow
        else
          :default
        end
      end

      # TODO:
      def _index
        @servers = Libertree::Model::Server.all
      end
    end
  end
end
