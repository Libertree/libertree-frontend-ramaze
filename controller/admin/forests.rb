module Controller
  module Admin
    class Forests < Controller::Admin::Base
      map '/admin/forests'

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
        @forests = Libertree::Model::Forest.all
      end

      def create
        redirect_referrer  if ! request.post?

        Libertree::Model::Forest.create(
          name: request['name'],
          local_is_member: true
        )

        redirect_referrer
      end
    end
  end
end
