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

          if request['source'].nil? || request['source'].to_s.strip.empty?
            respond '', 400
          end

          visibility = request['visibilty'] || 'forest'
          visibility = visibility.to_s

          post = Libertree::Model::Post.create(
            'member_id'  => @account.member.id,
            'visibility' => visibility,
            'text'       => request['text'].to_s + "\n\n*posted with " + request['source'].to_s + "*"
          )

          { 'success' => true }.to_json
        end
      end
    end
  end
end
