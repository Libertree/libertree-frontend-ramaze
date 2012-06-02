module Controller
  class Comments < Base
    map '/comments'

    before_all do
      require_login
    end

    layout do |path|
      if path =~ %r{^_}
        nil
      elsif session[:layout] == 'narrow'
        :narrow
      else
        :default
      end
    end

    def create
      return  if ! request.post?

      post = Libertree::Model::Post[ request['post_id'].to_i ]

      if post && ! request['text'].empty?
        # TODO: Check that the member is allowed to view and comment on the post.
        # (when we introduce such restrictions in the system)
        comment = Libertree::Model::Comment.create(
          'member_id' => account.member.id,
          'post_id'   => post.id,
          'text'      => request['text']
        )

        Libertree::Model::Job.create(
          task: 'request:COMMENT',
          params: {
            'comment_id' => comment.id,
          }.to_json
        )

        session[:saved_text]["textarea-comment-on-post-#{post.id}"] = nil
      end

      if request.referrer =~ /home/
        redirect request.referrer.gsub(/#post-\d+$/,'') + "#post-#{post.id}"
      else
        redirect "/posts/show/#{post.id}#comment-#{comment.id}"
      end
    end

    def _comments(post_id, hidden = false)
      @hidden = !! hidden
      # TODO: Check that member is allowed to view the post and its comments
      # (when we introduce such restrictions in the system)
      @post = Libertree::Model::Post[ post_id.to_i ]
      return ""  if @post.nil?
    end

    def destroy(comment_id)
      comment = Libertree::Model::Comment[ comment_id.to_i ]
      if comment && comment.member == account.member
        Libertree::Model::Job.create(
          task: 'request:COMMENT-DELETE',
          params: {
            'comment_id' => comment.id,
          }.to_json
        )
        comment.delete_cascade
      end
      ""
    end
  end
end
