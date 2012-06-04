module Controller
  module API
    module V1
      class Posts < Base
        map '/api/v1/posts'

        layout nil

        before_all do
          set_account_from_token
        end

        def create
          if ! request.post?
            respond '', 405
          end

          post = Libertree::Model::Post.create(
            'member_id' => @account.member.id,
            'public'    => true,
            'text'      => request['text']
          )
          Libertree::Model::Job.create(
            task: 'request:POST',
            params: {
              'post_id' => post.id,
            }.to_json
          )

          { 'success' => true }.to_json
        end
      end
    end
  end
end
