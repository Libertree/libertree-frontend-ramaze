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

      def add( forest_id, server_id )
        f = Libertree::Model::Forest[forest_id.to_i]
        return  if f.nil?

        s = Libertree::Model::Server[server_id.to_i]
        return  if s.nil?

        begin
          f.add s
        rescue PGError => e
          if e.message =~ /violates unique constraint/
            flash[:error] = 'The tree is already a member of the forest.'
          else
            raise e
          end
        end

        redirect Admin::Main.r(:/)
      end
    end
  end
end
