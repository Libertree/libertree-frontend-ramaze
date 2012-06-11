module Controller
  class PostIgnores < Base
    map '/posts/ignores'

    before_all do
      require_login
    end

    layout nil

    def create(post_id)
      post = Libertree::Model::Post[ post_id.to_i ]

      if post
        ignore = Libertree::Model::PostIgnore.find_or_create(
          'account_id' => account.id,
          'post_id'    => post.id,
        )

        return { 'success' => true }.to_json
      end

      ""
    end

    def destroy(post_ignore_id)
      ignore = Libertree::Model::PostIgnore[ post_ignore_id.to_i ]
      if ignore && ignore.account == account
        ignore.delete
      end
    end
  end
end
