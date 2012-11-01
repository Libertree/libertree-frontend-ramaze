module Controller
  class Comments < Base
    map '/comments'

    before_all do
      if action.view_value.nil?
        if Ramaze::Current.request.path !~ %r{^/posts/show/}
          require_login
        end
        init_locale
      end
    end

    layout do |path|
      if path =~ %r{^_|create}
        nil
      elsif session[:layout] == 'narrow'
        :narrow
      else
        :default
      end
    end

    def create
      return '{}'  if ! request.post?
      return '{}'  if request['text'].to_s.empty?

      post = Libertree::Model::Post[ request['post_id'].to_i ]

      return '{}'  if post.nil?

      # TODO: Check that the member is allowed to view and comment on the post.
      # (when we introduce such restrictions in the system)
      comment = Libertree::Model::Comment.create(
        'member_id' => account.member.id,
        'post_id'   => post.id,
        'text'      => request['text'].to_s
      )

      session[:saved_text]["textarea-comment-on-post-#{post.id}"] = nil

      {
        'success' => true,
        'commentId' => comment.id,
      }.to_json
    end

    def _comments_list
      @post ||= Libertree::Model::Post[ post_id.to_i ]
      @comment_fetch_options ||= { limit: 4 }
      @comments = @post.comments(@comment_fetch_options)
      @comments.each do |c|
        Libertree::Model::Notification.mark_seen_for_account_and_comment_id( account, c.id )
      end
    end

    def _comments(post_id, to_id, old_n)
      # TODO: Check that member is allowed to view the post and its comments
      # (when we introduce such restrictions in the system)
      @post = Libertree::Model::Post[ post_id.to_i ]
      return ""  if @post.nil?
      return ""  if ! @post.v_internet? && ! logged_in?

      @comments = @post.comments( {
        limit: 8,
        to_id: to_id.to_i,
      } )
      @num_shown = @comments.count + old_n.to_i
      if logged_in?
        @comments.each do |c|
          Libertree::Model::Notification.mark_seen_for_account_and_comment_id( account, c.id )
        end
      end
      @num_notifs_unseen = account.num_notifications_unseen
    end

    def _comment(comment_id, old_n = nil)
      @comment = Libertree::Model::Comment[comment_id.to_i]
      @post = @comment.post
      @old_n = old_n ? old_n.to_i : nil
      @n_total = @post.comments.count
      return ""  if ! @post.v_internet? && ! logged_in?
    end

    def destroy(comment_id)
      comment = Libertree::Model::Comment[ comment_id.to_i ]
      if comment && comment.member == account.member
        comment.delete_cascade
      end
      ""
    end
  end
end
