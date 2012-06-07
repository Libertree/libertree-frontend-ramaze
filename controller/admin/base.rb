module Controller
  module Admin
    class Base < Controller::Base
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
end
