module Controller
  module Admin
    class Servers < Controller::Admin::Base
      map '/admin/servers'

      before_all { require_admin }

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

      def create
        redirect_referrer  if ! request.post?

        uri = URI.parse( request['host'] )
        ip = Socket.getaddrinfo(uri.host, 14404)[0][3]

        Libertree::Model::Server.create(ip: ip)

        redirect_referrer
      end
    end
  end
end
