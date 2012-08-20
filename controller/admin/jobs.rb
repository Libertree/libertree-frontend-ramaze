module Controller
  module Admin
    class Jobs < Controller::Admin::Base
      map '/admin/jobs'

      before_all do
        require_admin
        init_locale
      end

      def index(task=nil)
        if task
          @unfinished = Libertree::Model::Job.s("SELECT * FROM jobs WHERE task = ? AND time_finished IS NULL", task)
          @task = task
        else
          @unfinished = Libertree::Model::Job.s("SELECT * FROM jobs WHERE time_finished IS NULL")
        end
      end

      def retry(job_id)
        job = Libertree::Model::Job[ job_id ]
        if job
          job.retry!
        end
        redirect_referrer
      end

      def destroy(job_id)
        job = Libertree::Model::Job[ job_id ]
        if job
          job.delete
        end
        redirect_referrer
      end

    end
  end
end
