module Controller
  module Admin
    class Main < Controller::Admin::Base
      map '/admin'

      before_all do
        require_admin
        init_locale
        @view = 'admin'
      end

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

      def jobs
        @unfinished = Libertree::Model::Job.s("SELECT * FROM jobs WHERE time_finished IS NULL")
      end
    end
  end
end
